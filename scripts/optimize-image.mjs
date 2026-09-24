#!/usr/bin/env node
/**
 * Reduz imagens para caber no upload do Pages CMS.
 *
 * O app.pagescms.org roda na Vercel, que corta o corpo do request em 4,5 MB, e o
 * upload trafega como base64 (que infla ~33%). O limite real é ~3,3 MB por arquivo.
 * Com o pipeline padrão (2400px + JPEG q80) o pior caso fica em ~2,6 MB em base64.
 *
 * Uso:
 *   npm run optimize -- public/images/0001.jpeg
 *   npm run optimize -- public/images/                  # lote, no lugar
 *   npm run optimize -- foto.jpg --out public/images    # grava em outro diretório
 *   npm run optimize -- foto.jpg --dry-run              # só mostra o que faria
 *
 * Opções:
 *   --max <px>       maior dimensão (padrão 2400)
 *   --quality <n>    qualidade JPEG 1-100 (padrão 80)
 *   --out <dir>      diretório de saída (padrão: o mesmo do arquivo)
 *   --dry-run        não grava nada
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, unlinkSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';

const MAX_EDGE = 2400;
const JPEG_QUALITY = 80;
const B64_LIMIT_BYTES = 4.5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.heic']);

const args = process.argv.slice(2);
const options = { max: MAX_EDGE, quality: JPEG_QUALITY, out: null, dryRun: false };
const targets = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--max') options.max = Number(args[++i]);
  else if (arg === '--quality') options.quality = Number(args[++i]);
  else if (arg === '--out') options.out = resolve(args[++i]);
  else if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--help' || arg === '-h') {
    console.log('Uso: npm run optimize -- <arquivo ou pasta> [...] [--out <dir>] [--max <px>] [--quality <n>] [--dry-run]');
    process.exit(0);
  } else targets.push(resolve(arg));
}

if (targets.length === 0) {
  console.error('Informe ao menos um arquivo ou pasta. Ex.: npm run optimize -- public/images/0001.jpeg');
  process.exit(1);
}

if (!Number.isFinite(options.max) || options.max < 200) { console.error('--max inválido.'); process.exit(1); }
if (!Number.isFinite(options.quality) || options.quality < 1 || options.quality > 100) { console.error('--quality inválido.'); process.exit(1); }

const sips = spawnSync('sips', ['--help'], { encoding: 'utf8' });
if (sips.error) {
  console.error('Não achei o `sips` (ferramenta do macOS). Instale o ImageMagick e use o `magick` manualmente.');
  process.exit(1);
}

function listImages(target) {
  const info = statSync(target, { throwIfNoEntry: false });
  if (!info) { console.error(`Não existe: ${target}`); return []; }
  if (info.isFile()) return [target];
  return readdirSync(target)
    .map((name) => join(target, name))
    .flatMap((file) => statSync(file).isDirectory() ? listImages(file) : [file])
    .filter((file) => statSync(file).isFile() && IMAGE_EXTENSIONS.has(extname(file).toLowerCase()))
    .sort();
}

function probe(file) {
  const { size } = statSync(file);
  const result = spawnSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  const width = Number(/pixelWidth:\s*(\d+)/.exec(result.stdout ?? '')?.[1] ?? 0);
  const height = Number(/pixelHeight:\s*(\d+)/.exec(result.stdout ?? '')?.[1] ?? 0);
  return { size, width, height, edge: Math.max(width, height) };
}

function human(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function b64(bytes) {
  return Math.ceil(bytes / 3) * 4;
}

let optimized = 0;
let skipped = 0;
let planned = 0;
let saved = 0;
let wouldFail = 0;

for (const target of targets.flatMap(listImages)) {
  const ext = extname(target).toLowerCase();
  const jpeg = ext === '.jpg' || ext === '.jpeg';
  const before = probe(target);
  const needsResize = before.edge > options.max;
  const outDir = options.out ?? dirname(target);
  const outFile = join(outDir, basename(target));
  const scratch = join(outDir, `.optimize-${process.pid}-${basename(target)}`);

  if (!needsResize && b64(before.size) < B64_LIMIT_BYTES && (!jpeg || before.size < 1.2 * 1024 * 1024)) {
    const note = b64(before.size) >= B64_LIMIT_BYTES ? 'ACIMA DO LIMITE' : 'ok';
    console.log(`  = ${basename(target).padEnd(28)} ${human(before.size).padStart(9)}  já está bom (${note})`);
    skipped += 1;
    continue;
  }

  if (options.dryRun) {
    console.log(`  ? ${basename(target).padEnd(28)} ${human(before.size).padStart(9)}  ${before.width}x${before.height} → redimensionaria`);
    planned += 1;
    continue;
  }

  mkdirSync(outDir, { recursive: true });
  copyFileSync(target, scratch);

  const steps = [];
  if (needsResize) steps.push('-Z', String(options.max));
  if (jpeg) steps.push('-s', 'format', 'jpeg', '-s', 'formatOptions', String(options.quality));

  const run = steps.length > 0 ? spawnSync('sips', [...steps, scratch, '--out', scratch], { encoding: 'utf8' }) : { status: 0 };
  if (run.status !== 0) {
    console.error(`  ! ${basename(target)}: sips falhou (${run.stderr ?? run.error ?? 'desconhecido'})`);
    unlinkSync(scratch);
    continue;
  }

  const after = probe(scratch);
  if (after.size >= before.size) {
    console.log(`  = ${basename(target).padEnd(28)} ${human(before.size).padStart(9)}  nada ganho, mantido`);
    unlinkSync(scratch);
    skipped += 1;
    continue;
  }

  copyFileSync(scratch, outFile);
  unlinkSync(scratch);

  const traffic = b64(after.size);
  const flag = traffic >= B64_LIMIT_BYTES ? '  ACIMA DO LIMITE' : '';
  if (traffic >= B64_LIMIT_BYTES) wouldFail += 1;
  console.log(`  > ${basename(target).padEnd(28)} ${human(before.size).padStart(9)} → ${human(after.size).padStart(9)}  ${after.width}x${after.height}  b64 ${human(traffic)}${flag}`);
  optimized += 1;
  saved += before.size - after.size;
}

console.log('');
console.log(`Otimizadas: ${optimized}  ·  planejadas: ${planned}  ·  mantidas: ${skipped}  ·  economia: ${human(saved)}`);
console.log(`Limite do Pages CMS: 4,5 MB em base64 (~3,3 MB de arquivo).`);
if (wouldFail > 0) console.warn(`Atenção: ${wouldFail} arquivo(s) ainda estouram o limite — baixe --max ou --quality.`);
if (optimized > 0) console.log('Agora é só subir pelo CMS ou commitar em public/images/.');
