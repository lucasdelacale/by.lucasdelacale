#!/usr/bin/env node
import { existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = join(root, 'public/images');
const outputDir = join(root, 'public/images/responsive');
const SIZES = [400, 800, 1600];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function filesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  }).filter((f) => IMAGE_EXTENSIONS.has(extname(f).toLowerCase()));
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const files = filesIn(sourceDir);
  let generated = 0;

  for (const file of files) {
    const name = basename(file, extname(file));
    const ext = extname(file).toLowerCase();

    // Skip if already in responsive dir
    if (file.includes('/responsive/')) continue;

    try {
      const image = sharp(file);
      const metadata = await image.metadata();
      if (!metadata.width || !metadata.height) continue;

      // Generate WebP variants at each size
      for (const size of SIZES) {
        if (metadata.width <= size && metadata.height <= size) continue;
        const outFile = join(outputDir, `${name}-${size}.webp`);
        if (existsSync(outFile)) continue;
        await sharp(file)
          .resize(size, size, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outFile);
        generated++;
      }

      // Generate full-size WebP (for srcset fallback)
      const fullOut = join(outputDir, `${name}.webp`);
      if (!existsSync(fullOut) && ext !== '.webp') {
        await sharp(file)
          .webp({ quality: 82 })
          .toFile(fullOut);
        generated++;
      }
    } catch (e) {
      console.warn(`⚠ Erro ao processar ${name}${ext}: ${e.message}`);
    }
  }

  console.log(`Variantes responsivas geradas: ${generated} arquivos em public/images/responsive/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
