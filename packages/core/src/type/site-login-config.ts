/**
 * Website login (Site Login): after an OIDC login beabee also sets a cookie on
 * the parent domain holding the encrypted ID token, which the website's edge
 * reads to recognise the member. Unset when BEABEE_SITELOGIN_KEY is missing.
 */
export interface SiteLoginConfig {
  cookieName: string; // BEABEE_SITELOGIN_COOKIE_NAME - Cookie name (e.g. __Secure-correctiv_login)
  cookieDomain: string; // BEABEE_SITELOGIN_COOKIE_DOMAIN - Parent domain shared with the website
  cookieMaxAge: number; // BEABEE_SITELOGIN_COOKIE_MAXAGE - Seconds; longer than the ID token lifetime so an expired token can still trigger a silent refresh
  key: Buffer; // BEABEE_SITELOGIN_KEY - 32 bytes, base64; shared with the website's edge
}
