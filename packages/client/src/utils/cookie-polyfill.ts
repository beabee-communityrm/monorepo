/**
 * Cookie storage for fetch in Node.js environment
 * Polyfills browser-like cookie behavior for testing and Server applications
 */
export class CookiePolyfill {
  // Global cookie storage for all instances
  private static cookies = new Set<string>();

  /**
   * Checks if we're in a browser-like environment with proper cookie handling
   */
  protected static readonly hasNativeCookieSupport: boolean = !!(
    typeof globalThis !== 'undefined' &&
    globalThis.document?.cookie !== undefined
  );

  /**
   * Check if cookies should be used
   */
  static shouldBeUsed(credentials?: RequestCredentials): boolean {
    return (
      !this.hasNativeCookieSupport &&
      (credentials === 'include' || credentials === 'same-origin')
    );
  }

  /**
   * Parse and validate a cookie string
   */
  private static parseCookie(cookie: string): string | null {
    if (!cookie || typeof cookie !== 'string') return null;

    try {
      // Basic validation that it's a key=value format
      if (!cookie.includes('=')) return null;

      // Check expiration
      const lowerCookie = cookie.toLowerCase();
      if (lowerCookie.includes('expires=')) {
        const match = /expires=([^;]+)/.exec(lowerCookie);
        if (match) {
          const expiresDate = new Date(match[1]);
          if (isNaN(expiresDate.getTime()) || expiresDate < new Date()) {
            return null;
          }
        }
      }

      return cookie;
    } catch (error) {
      console.warn('Failed to parse cookie:', error);
      return null;
    }
  }

  /**
   * Store cookies with validation
   */
  static store(cookies: string[]): void {
    if (!Array.isArray(cookies)) return;

    for (const cookie of cookies) {
      const validCookie = this.parseCookie(cookie);
      if (validCookie) {
        this.cookies.add(validCookie);
      }
    }
  }

  /**
   * Get stored cookies
   */
  static get(): string[] {
    return Array.from(this.cookies);
  }

  /**
   * Clear stored cookies
   */
  static clear(): void {
    this.cookies.clear();
  }
}
