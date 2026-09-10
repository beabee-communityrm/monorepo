import * as oidc from 'openid-client';

import config from '#config/config';
import type { OidcLoginConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import type { OidcLoginState } from '#type/index';

const log = mainLogger.child({ app: 'oidc' });

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
        settings.clientSecret || undefined,
        // A client without a secret is a public client relying on PKCE
        settings.clientSecret ? undefined : oidc.None(),
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
 * @param next Validated internal path to continue to after login
 */
export async function startOidcLogin(
  next?: string
): Promise<{ url: string; loginState: OidcLoginState }> {
  const settings = getSettings();
  const oidcConfig = await getOidcConfig();

  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();

  const url = oidc.buildAuthorizationUrl(oidcConfig, {
    redirect_uri: settings.redirectUri,
    scope: settings.scopes,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    nonce,
  });

  return { url: url.href, loginState: { state, nonce, codeVerifier, next } };
}

/**
 * Complete an OIDC login: exchange the authorization code for tokens and
 * validate state, nonce and PKCE verifier.
 * @param callbackSearch The query string the identity provider redirected with
 * @param loginState The login state stored in the session by startOidcLogin
 * @returns The IdP subject and the raw ID token (kept as the logout hint)
 */
export async function completeOidcLogin(
  callbackSearch: string,
  loginState: OidcLoginState
): Promise<{ subject: string; idToken: string | undefined }> {
  const oidcConfig = await getOidcConfig();

  // The redirect URI is registered at the IdP and must match exactly
  const callbackUrl = new URL(getSettings().redirectUri);
  callbackUrl.search = callbackSearch;

  const tokens = await oidc.authorizationCodeGrant(oidcConfig, callbackUrl, {
    pkceCodeVerifier: loginState.codeVerifier,
    expectedState: loginState.state,
    expectedNonce: loginState.nonce,
    idTokenExpected: true,
  });

  const claims = tokens.claims();
  if (!claims) {
    throw new Error('OIDC token response did not include an ID token');
  }

  return { subject: claims.sub, idToken: tokens.id_token };
}

/**
 * The identity provider's logout URL (RP-initiated logout), falling back to
 * the post-logout redirect URI if the IdP has no end session endpoint or is
 * unreachable.
 * @param idToken The ID token from login, used as logout hint
 */
export async function getOidcLogoutUrl(idToken?: string): Promise<string> {
  const settings = getSettings();
  try {
    const oidcConfig = await getOidcConfig();
    if (oidcConfig.serverMetadata().end_session_endpoint) {
      return oidc.buildEndSessionUrl(oidcConfig, {
        post_logout_redirect_uri: settings.postLogoutRedirectUri,
        ...(idToken && { id_token_hint: idToken }),
      }).href;
    }
  } catch (err) {
    log.error('Failed to build OIDC logout URL', err);
  }
  return settings.postLogoutRedirectUri;
}
