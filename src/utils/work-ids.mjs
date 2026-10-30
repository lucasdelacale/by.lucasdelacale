import { readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative, sep } from 'node:path';

// Área cujos nomes de arquivo mantêm o ID nu (é a área original; as URLs públicas já dependem disso).
const BARE_ID_AREA = 'fotografias';

/** Lista os arquivos .md de obras como caminhos relativos a `worksDir`, com "/" como separador. */
export function listWorkFiles(worksDir) {
  const walk = (directory) => readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return walk(path);
    return extname(path).toLowerCase() === '.md' || extname(path).toLowerCase() === '.mdx' ? [path] : [];
  });
  return walk(worksDir).map((path) => relative(worksDir, path).split(sep).join('/'));
}

/**
 * Regra de ID público de cada obra:
 * - nome do arquivo quando ele é único entre todas as áreas;
 * - "<area>-<nome>" quando o mesmo nome existe em outra área (exceto fotografias, que mantém o nome nu).
 * Retorna Map: caminho relativo -> ID. Não há colisão por construção.
 */
export function computeWorkIds(relativePaths) {
  const stem = (path) => basename(path, extname(path));
  const counts = new Map();
  for (const path of relativePaths) counts.set(stem(path), (counts.get(stem(path)) ?? 0) + 1);

  const ids = new Map();
  for (const path of relativePaths) {
    const [area] = path.split('/');
    const name = stem(path);
    const needsArea = counts.get(name) > 1 && area !== BARE_ID_AREA;
    ids.set(path, needsArea ? `${area}-${name}` : name);
  }
  return ids;
}
