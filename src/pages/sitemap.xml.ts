import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const staticPaths = ['/', '/acervo/', '/trabalhos/', '/series/', '/sobre/'];

export const GET: APIRoute = async ({ site }) => {
  const works = await getCollection('works');
  const series = await getCollection('series');
  const texts = await getCollection('texts');
  const origin = site ?? new URL('https://lucasdelacale.com');
  const paths = [
    ...staticPaths,
    ...works.map((item) => `/acervo/${item.id}/`),
    ...series.map((item) => `/series/${item.id}/`),
    ...texts.map((item) => `/textos/${item.id}/`),
  ];
  const urls = [...new Set(paths)].map((path) => `<url><loc>${new URL(path, origin)}</loc></url>`).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
