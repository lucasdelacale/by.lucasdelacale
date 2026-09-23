export function sortByPublishedAt<T extends { id: string; data: any }>(items: T[]): T[] {
  return [...items].sort(compareByPublishedAt);
}

export function normalizeContentId(value: unknown): string {
  return String(value ?? '')
    .trim()
    .split('/')
    .pop()
    ?.replace(/\.(?:md|mdx)$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') ?? '';
}

export function compareByPublishedAt<T extends { id: string; data: any }>(a: T, b: T): number {
  const dateDifference = getPublicationTime(b) - getPublicationTime(a);

  return dateDifference || b.id.localeCompare(a.id);
}

function getPublicationTime(item: { data: any }): number {
  const value = item.data.publishedAt ?? item.data.date ?? item.data.year ?? item.data.period;

  if (!value) return 0;

  const parsedDate = Date.parse(String(value));
  if (!Number.isNaN(parsedDate)) return parsedDate;

  const years = String(value).match(/\d{4}/g);
  return years ? Date.UTC(Number(years[years.length - 1]), 11, 31) : 0;
}

/** Tipos de obra colocados à venda — alimentam /trabalhos/. */
export const PURCHASABLE_TYPES = ['print', 'canvas', 'escultura'] as const;

export function isPurchasable(type?: string | null): boolean {
  return (PURCHASABLE_TYPES as readonly string[]).includes(String(type ?? '').toLowerCase());
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

type SeriesLike = { id: string; data: { title?: string | null; works?: string[] | null } };
type WorkLike = { id: string; data: { series?: string | null } };

/**
 * Resolve o nome de exibição da(s) série(s) de uma obra.
 * A relação é bidirecional: pela obra (`data.series`) ou pela lista `works` da série.
 * Devolve o título da série (com trim), nunca o slug cru.
 */
export function resolveSeriesLabels(allSeries: SeriesLike[], work: WorkLike): string[] {
  const workKey = normalizeContentId(work.id);
  const ownKey = normalizeContentId(work.data.series);
  const labels: string[] = [];

  for (const entry of allSeries) {
    const seriesKey = normalizeContentId(entry.id);
    const title = String(entry.data.title ?? '').trim();
    if (!title) continue;

    const listed = (entry.data.works ?? []).some((id) => normalizeContentId(id) === workKey);
    const linked = Boolean(ownKey) && (seriesKey === ownKey || normalizeContentId(entry.data.title) === ownKey);

    if ((listed || linked) && !labels.includes(title)) labels.push(title);
  }

  return labels;
}

export function resolveSeriesLabel(allSeries: SeriesLike[], work: WorkLike): string | null {
  return resolveSeriesLabels(allSeries, work).join(' / ') || null;
}
