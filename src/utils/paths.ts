export function sitePath(path: string | null | undefined): string | null | undefined {
  if (!path || /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('#')) return path;

  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return `${base}${path.replace(/^\/+/, '')}`;
}

export function responsiveSrcset(path: string | null | undefined): string | undefined {
  if (!path || !path.startsWith('/images/')) return undefined;
  const name = path.replace(/^\/images\//, '').replace(/\.[^.]+$/, '');
  const variants = [400, 800, 1600]
    .map((size) => `/images/responsive/${name}-${size}.webp ${size}w`)
    .join(', ');
  return variants;
}
