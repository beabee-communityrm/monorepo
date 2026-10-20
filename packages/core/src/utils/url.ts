/**
 * Whether a URL is an internal path safe to redirect to: it starts with a
 * single slash (browsers read a second slash or a backslash as the start of
 * a host) and carries no line breaks, which would end the redirect header.
 */
export function isValidNextUrl(url: string): boolean {
  return /^\/(?![/\\])[^\r\n]*$/.test(url);
}

/**
 * Whether a URL is an absolute URL on one of the given origins, safe to
 * redirect to after login: exact origin match, no credentials (browsers may
 * show them in the address bar) and no line breaks
 */
export function isAllowedReturnUrl(url: string, origins: string[]): boolean {
  if (/[\r\n]/.test(url)) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return (
    !parsed.username && !parsed.password && origins.includes(parsed.origin)
  );
}

export function getNextParam(url: string): string {
  return isValidNextUrl(url) ? '?next=' + encodeURIComponent(url) : '';
}
