export function isValidNextUrl(url: string): boolean {
  return /^\/([^/]|$)/.test(url);
}

export function getNextParam(url: string): string {
  return isValidNextUrl(url) ? "?next=" + encodeURIComponent(url) : "";
}
