export function sortByPublishedAt<T extends { id: string; data: any }>(items: T[]): T[] {
  return [...items].sort(compareByPublishedAt);
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
