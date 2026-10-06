import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const works = await getCollection('works');
  const series = await getCollection('series');
  const texts = await getCollection('texts');
  const origin = site ?? new URL('https://lucasdelacale.com');
  const now = new Date().toISOString();

  const getUrl = (path: string, lastmod?: string) => {
    const loc = new URL(path, origin);
    return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  };

  const paths = [
    getUrl('/', now),
    getUrl('/acervo/', now),
    getUrl('/trabalhos/', now),
    getUrl('/series/', now),
    getUrl('/sobre/', now),
    ...works.map((item) => {
      const date = item.data.publishedAt ? new Date(item.data.publishedAt).toISOString() : now;
      return getUrl(`/acervo/${item.id}/`, date);
    }),
    ...series.map((item) => {
      const date = item.data.publishedAt ? new Date(item.data.publishedAt).toISOString() : now;
      return getUrl(`/series/${item.id}/`, date);
    }),
    ...texts.map((item) => {
      const date = item.data.publishedAt ? new Date(item.data.publishedAt).toISOString() : now;
      return getUrl(`/textos/${item.id}/`, date);
    }),
  ];

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
