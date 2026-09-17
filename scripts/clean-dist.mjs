import { existsSync, rmSync } from 'node:fs';

for (const directory of ['dist', '.astro', 'node_modules/.astro']) {
  if (existsSync(directory)) rmSync(directory, { recursive: true, force: true });
}
