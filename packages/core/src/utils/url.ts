/**
 * Whether a URL is an internal path safe to redirect to: it starts with a
 * single slash (browsers read a second slash or a backslash as the start of
 * a host) and carries no line breaks, which would end the redirect header.
 */
export function isValidNextUrl(url: string): boolean {
  return /^\/(?![/\\])[^\r\n]*$/.test(url);
}

export function getNextParam(url: string): string {
  return isValidNextUrl(url) ? '?next=' + encodeURIComponent(url) : '';
}
