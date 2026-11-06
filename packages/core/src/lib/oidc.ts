import * as oidc from 'openid-client';

import config from '#config/config';
import type { OidcLoginConfig } from '#config/config';
import { OidcLoginDeniedError } from '#errors/index';
import { log as mainLogger } from '#logging';
import type { OidcLoginState } from '#type/index';

const log = mainLogger.child({ app: 'oidc' });

// Registered at the IdP for this instance, so fixed to its public URL
export const LOGIN_URI = `${config.audience}/api/1.0/auth/login`;
export const REDIRECT_URI = `${config.audience}/api/1.0/auth/callback`;
export const POST_LOGOUT_REDIRECT_URI = `${config.audience}/api/1.0/auth/logout/callback`;

/**
 * Whether members log in at the identity provider (OIDC Login) instead of
 * with a beabee password (Local Login)
 */
export function isOidcEnabled(): boolean {
  return config.login.provider === 'oidc';
}

function getSettings(): OidcLoginConfig['settings'] {
  if (config.login.provider !== 'oidc') {
    throw new Error('OIDC login is not enabled (BEABEE_LOGIN_PROVIDER)');
  }
  return config.login.settings;
}

let discoveryPromise: Promise<oidc.Configuration> | null = null;

/**
 * The OIDC client configuration, discovering the issuer metadata on first
 * use. Discovery is lazy so the backend can boot while the identity provider
 * is unreachable; a failed discovery is retried on the next login attempt.
 */
function getOidcConfig(): Promise<oidc.Configuration> {
  if (!discoveryPromise) {
    const settings = getSettings();
    discoveryPromise = oidc
      .discovery(
        new URL(settings.issuer),
        settings.clientId,
        undefined,
        // A client without a secret is a public client relying on PKCE
        settings.clientSecret
          ? oidc.ClientSecretBasic(settings.clientSecret)
          : oidc.None(),
        // Allow plain-http issuers (e.g. local Keycloak) in development only
        config.dev ? { execute: [oidc.allowInsecureRequests] } : undefined
      )
      .catch((err) => {
        discoveryPromise = null;
        throw err;
      });
  }
  return discoveryPromise;
}

/**
 * Start an OIDC login: build the authorization URL with PKCE, state and nonce.
 * The returned state must be stored in the session for the callback.
 * @param next Validated internal path or allowed return URL to continue to after login
 * @param prompt `login` makes the IdP re-authenticate the member even with
 * a live session there, for a fresh login before sensitive account changes.
 * @param loginHint The member's login name, so the IdP skips its login
 * name form and goes straight to the credential check
 */
export async function startOidcLogin(
  next?: string,
  prompt?: 'login',
  loginHint?: string
): Promise<{ url: string; loginState: OidcLoginState }> {
  const settings = getSettings();
  const oidcConfig = await getOidcConfig();

  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();

  // The website login cookie is renewed with a refresh token, so only Site
  // Login needs one
  const scope = config.siteLogin
    ? settings.scopes + ' offline_access'
    : settings.scopes;

  const url = oidc.buildAuthorizationUrl(oidcConfig, {
    redirect_uri: REDIRECT_URI,
    scope,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce,
    ...(prompt && { prompt }),
    ...(loginHint && { login_hint: loginHint }),
  });

  return {
    url: url.href,
    loginState: { state, nonce, codeVerifier, next, prompt },
  };
}

/**
 * Complete an OIDC login: exchange the authorization code for tokens and
 * validate state, nonce and PKCE verifier.
 * @param callbackSearch The query string the identity provider redirected with
 * @param loginState The login state stored in the session by startOidcLogin
 * @returns The IdP subject, the raw ID token (kept as the logout hint), the
 * refresh token if one was issued and when the member authenticated at the
 * IdP, as seconds since the epoch
 */
export async function completeOidcLogin(
  callbackSearch: string,
  loginState: OidcLoginState
): Promise<{
  subject: string;
  idToken: string | undefined;
  refreshToken: string | undefined;
  authTime: number | undefined;
}> {
  const oidcConfig = await getOidcConfig();

  // The redirect URI is registered at the IdP and must match exactly
  const callbackUrl = new URL(REDIRECT_URI);
  callbackUrl.search = callbackSearch;

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(oidcConfig, callbackUrl, {
      pkceCodeVerifier: loginState.codeVerifier,
      expectedState: loginState.state,
      expectedNonce: loginState.nonce,
    });
  } catch (err) {
    // The IdP sent the browser back with an error instead of a code
    if (err instanceof oidc.AuthorizationResponseError) {
      throw new OidcLoginDeniedError(err.error, err.error_description);
    }
    throw err;
  }

  const claims = tokens.claims();
  if (!claims) {
    throw new Error('OIDC token response did not include an ID token');
  }

  return {
    subject: claims.sub,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    authTime: claims.auth_time,
  };
}

/**
 * Renew the ID token with a refresh token, without the browser going to the
 * IdP. Zitadel rotates the token: the one handed in is spent after this call
 * and the returned one replaces it.
 * @returns The new ID and refresh tokens, or null if the IdP rejected the
 * refresh token (revoked, expired or already rotated); other failures throw
 */
export async function refreshOidcLogin(
  refreshToken: string
): Promise<{ idToken: string; refreshToken: string } | null> {
  const oidcConfig = await getOidcConfig();
  try {
    const tokens = await oidc.refreshTokenGrant(oidcConfig, refreshToken);
    if (!tokens.id_token) {
      throw new Error('OIDC refresh response did not include an ID token');
    }
    return {
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token || refreshToken,
    };
  } catch (err) {
    if (err instanceof oidc.ResponseBodyError) {
      log.info(`OIDC refresh rejected: ${err.error} ${err.error_description}`);
      return null;
    }
    throw err;
  }
}

/**
 * Revoke a refresh token at the IdP. Ending the IdP session does not revoke
 * it, so a logout has to; a failure is logged, as the logout must go on.
 */
export async function revokeOidcRefreshToken(
  refreshToken: string
): Promise<void> {
  try {
    const oidcConfig = await getOidcConfig();
    await oidc.tokenRevocation(oidcConfig, refreshToken, {
      token_type_hint: 'refresh_token',
    });
  } catch (err) {
    log.error('Failed to revoke OIDC refresh token', err);
  }
}

/**
 * The identity provider's logout URL (RP-initiated logout), falling back to
 * the logout callback if the IdP has no end session endpoint or is
 * unreachable.
 * @param idToken The ID token from login, used as logout hint
 * @param state Carried through the IdP unchanged and handed to the logout
 * callback as ?state=
 */
export async function getOidcLogoutUrl(
  idToken?: string,
  state?: string
): Promise<string> {
  try {
    const oidcConfig = await getOidcConfig();
    if (oidcConfig.serverMetadata().end_session_endpoint) {
      return oidc.buildEndSessionUrl(oidcConfig, {
        post_logout_redirect_uri: POST_LOGOUT_REDIRECT_URI,
        ...(idToken && { id_token_hint: idToken }),
        ...(state && { state }),
      }).href;
    }
  } catch (err) {
    log.error('Failed to build OIDC logout URL', err);
  }
  if (!state) return POST_LOGOUT_REDIRECT_URI;
  const fallback = new URL(POST_LOGOUT_REDIRECT_URI);
  fallback.searchParams.set('state', state);
  return fallback.href;
}
