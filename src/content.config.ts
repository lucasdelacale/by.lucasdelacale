import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Accepts both local files from public/ and hosted image URLs.
const image = z.string().min(1).nullish();
const publishedAt = z.union([z.string(), z.date()]).nullish();

const works = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/works' }),
  schema: z.object({
    title: z.string().nullish(),
    publishedAt,
    year: z.number().nullish(),
    type: z.string().nullish(),
    series: z.string().nullish(),
    materials: z.array(z.string()).nullish(),
    dimensions: z.string().nullish(),
    coverImage: image,
    coverAlt: z.string().nullish(),
    caption: z.string().nullish(),
    gallery: z.array(image).nullish(),
    tags: z.array(z.string()).nullish(),
    featured: z.boolean().nullish().default(false),
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

const references = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/references' }),
  schema: z.object({
    title: z.string().nullish(),
    publishedAt,
    kind: z.string().nullish(),
    year: z.number().nullish(),
    image,
    imageAlt: z.string().nullish(),
    relatedWorks: z.array(z.string()).nullish(),
    relatedSeries: z.array(z.string()).nullish(),
  }),
});

export const collections = { works, series, texts, references };
