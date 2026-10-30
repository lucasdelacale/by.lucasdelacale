import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { computeWorkIds, listWorkFiles } from './utils/work-ids.mjs';

// Accepts both local files from public/ and hosted image URLs.
const image = z.string().min(1).nullish();
const gallery = z.array(z.string().min(1)).nullish();
const publishedAt = z.union([z.string(), z.date()]).nullish();
const workType = z.enum(['fotografia', 'print', 'gravura', 'canvas', 'escultura', 'referencia', 'outro']).nullish();

// IDs públicos das obras: regra única em utils/work-ids.mjs (também usada por scripts/validate-content.mjs).
const workIds = computeWorkIds(listWorkFiles('./src/content/works'));

const works = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/works',
    generateId: ({ entry }) => workIds.get(entry) ?? entry,
  }),
  schema: z.object({
    title: z.string().nullish(),
    publishedAt,
    year: z.number().nullish(),
    type: workType,
    series: z.string().nullish(),
    materials: z.array(z.string()).nullish(),
    dimensions: z.string().nullish(),
    coverImage: image,
    coverAlt: z.string().nullish(),
    caption: z.string().nullish(),
    gallery,
    tags: z.array(z.string()).nullish(),
    featured: z.boolean().nullish().default(false),
    price: z.number().min(0).nullish(),
    sold: z.boolean().nullish().default(false),
    relatedWorks: z.array(z.string()).nullish(),
    relatedReferences: z.array(z.string()).nullish(),
    relatedTexts: z.array(z.string()).nullish(),
    photoCredit: z.string().nullish(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/series' }),
  schema: z.object({
    title: z.string().nullish(),
    publishedAt,
    period: z.string().nullish(),
    coverImage: z.string().min(1),
    coverAlt: z.string().nullish(),
    works: z.array(z.string()).nullish(),
    references: z.array(z.string()).nullish(),
    texts: z.array(z.string()).nullish(),
  }),
});

const texts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/texts' }),
  schema: z.object({
    title: z.string().nullish(),
    publishedAt,
    kind: z.string().nullish(),
    date: z.string().nullish(),
    relatedWorks: z.array(z.string()).nullish(),
    relatedReferences: z.array(z.string()).nullish(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
  schema: z.object({
    title: z.string().min(1),
    subtitle: z.string().nullish(),
    publishedAt,
    author: z.string().nullish(),
    pages: z.number().int().min(1).nullish(),
    coverImage: image,
    coverAlt: z.string().nullish(),
    downloadFile: z.string().min(1),
  }),
});

export const collections = { works, series, texts, books };
