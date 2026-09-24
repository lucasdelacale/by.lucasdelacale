#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';

const root = process.cwd();
const contentRoot = join(root, 'src/content');
const publicRoot = join(root, 'public');
const errors = [];

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesIn(path) : extname(path).toLowerCase() === '.md' ? [path] : [];
  });
}

function frontmatter(file) {
  const source = readFileSync(file, 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? '';
}

function values(text, key) {
  return [...text.matchAll(new RegExp(`^\\s*(?:- )?${key}:\\s*["']?([^"'\\n]+)`, 'gm'))].map((match) => match[1].trim());
}

function normalize(value) {
  return value.trim().split('/').pop()?.replace(/\.(?:md|mdx)$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? '';
}

const workFiles = filesIn(join(contentRoot, 'works'));
const seriesFiles = filesIn(join(contentRoot, 'series'));
const ids = new Map();

for (const file of workFiles) {
  const id = basename(file, extname(file));
  const previous = ids.get(id);
  if (previous) errors.push(`ID duplicado "${id}": ${relative(root, previous)} e ${relative(root, file)}`);
  ids.set(id, file);

  const data = frontmatter(file);
  const type = values(data, 'type')[0];
  if (type && !['fotografia', 'print', 'gravura', 'canvas', 'escultura', 'referencia', 'outro'].includes(type.toLowerCase())) {
    errors.push(`Tipo inválido "${type}" em ${relative(root, file)}`);
  }

  for (const image of [...values(data, 'coverImage'), ...values(data, 'gallery')]) {
    if (image.startsWith('/images/') && !existsSync(join(publicRoot, image.slice(1)))) {
      errors.push(`Imagem não encontrada "${image}" em ${relative(root, file)}`);
    }
  }
}

const seriesIds = new Set(seriesFiles.map((file) => normalize(basename(file, extname(file)))));
for (const file of workFiles) {
  const series = values(frontmatter(file), 'series');
  for (const value of series) {
    if (value && !seriesIds.has(normalize(value))) errors.push(`Série não encontrada "${value}" em ${relative(root, file)}`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `✖ ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Conteúdo válido: ${workFiles.length} obras e ${seriesFiles.length} séries.`);
