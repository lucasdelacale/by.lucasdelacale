#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';

const root = process.cwd();
const mediaRoot = join(root, 'public/images');
const contentRoot = join(root, 'src/content');
const output = join(root, 'src/data/media-inventory.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

function contentTitle(source, file) {
  const title = source.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();
  return title || relative(contentRoot, file).replace(/\.(?:md|mdx)$/i, '');
}

const usage = new Map();
for (const file of filesIn(contentRoot).filter((file) => /\.(?:md|mdx)$/i.test(file))) {
  const source = readFileSync(file, 'utf8');
  const label = `${contentTitle(source, file)} · ${relative(contentRoot, file)}`;
  const paths = source.match(/\/images\/[^\s"'`<>]+/g) ?? [];

  for (const rawPath of paths) {
    const imagePath = `/${rawPath.replace(/^\/+/, '').replace(/[),.;]+$/, '')}`;
    const entries = usage.get(imagePath) ?? new Set();
    entries.add(label);
    usage.set(imagePath, entries);
  }
}

const inventory = filesIn(mediaRoot)
  .filter((file) => imageExtensions.has(extname(file).toLowerCase()))
  .map((file) => {
    const path = `/${relative(join(root, 'public'), file).split(sep).join('/')}`;
    const usedIn = [...(usage.get(path) ?? [])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const stat = statSync(file);

    return {
      filename: basename(file),
      path,
      status: usedIn.length > 0 ? 'PUBLICADA' : 'DISPONÍVEL',
      usedIn,
      size: stat.size,
      format: extname(file).slice(1).toUpperCase(),
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path, 'pt-BR'));

mkdirSync(join(root, 'src/data'), { recursive: true });
writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`);

const published = inventory.filter((item) => item.status === 'PUBLICADA').length;
console.log(`Inventário atualizado: ${inventory.length} imagens, ${published} publicadas, ${inventory.length - published} disponíveis.`);
