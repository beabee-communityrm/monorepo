export const isAbsoluteUrl = (url: string): boolean =>
  url && (isBlobUrl(url) || /^https?:\/\//i.test(url));

export const isBlobUrl = (url: string): boolean =>
  url && url.startsWith("blob:");
