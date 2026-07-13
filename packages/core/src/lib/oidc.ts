import * as oidc from 'openid-client';

import config from '#config/config';
import { log as mainLogger } from '#logging';

const log = mainLogger.child({ app: 'oidc-lib' });

/**
 * Parameters stored in the session between the login redirect and the callback
 */
export interface OidcLoginState {
  state: string;
  nonce: string;
  codeVerifier: string;
  next?: string | undefined;
}

let discoveryPromise: Promise<oidc.Configuration> | null = null;

/**
 * Whether OIDC authentication is configured for this instance
 */
export function isOidcEnabled(): boolean {
  return config.oidc.issuer !== '';
}

/**
 * Get the OIDC client configuration, discovering the issuer metadata on first
 * use. Discovery is lazy so the backend can boot while the identity provider
 * is unreachable; a failed discovery is retried on the next login attempt.
 */
export function getOidcConfig(): Promise<oidc.Configuration> {
  if (!isOidcEnabled()) {
    throw new Error('OIDC is not configured (BEABEE_OIDC_ISSUER is not set)');
  }
  if (!discoveryPromise) {
    discoveryPromise = oidc
      .discovery(
        new URL(config.oidc.issuer),
        config.oidc.clientId,
        config.oidc.clientSecret
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
 * @param next Validated internal path to redirect to after login
 */
export async function startOidcLogin(
  next?: string
): Promise<{ url: string; loginState: OidcLoginState }> {
  const oidcConfig = await getOidcConfig();

  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();

  const url = oidc.buildAuthorizationUrl(oidcConfig, {
    redirect_uri: config.oidc.redirectUri,
    scope: config.oidc.scopes,
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
 * @param callbackUrl The full callback URL the user agent requested
 * @param loginState The login state stored in the session by startOidcLogin
 * @returns The IdP subject and the raw ID token (kept for the logout hint)
 */
export async function completeOidcLogin(
  callbackUrl: URL,
  loginState: OidcLoginState
): Promise<{ subject: string; idToken: string | undefined }> {
  const oidcConfig = await getOidcConfig();

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
 * Build the IdP logout URL for RP-initiated logout, falling back to the
 * post-logout redirect URI if the IdP has no end session endpoint or is
 * unreachable.
 * @param idToken The ID token from login, used as logout hint
 */
export async function getOidcLogoutUrl(idToken?: string): Promise<string> {
  try {
    const oidcConfig = await getOidcConfig();
    if (oidcConfig.serverMetadata().end_session_endpoint) {
      return oidc.buildEndSessionUrl(oidcConfig, {
        post_logout_redirect_uri: config.oidc.postLogoutRedirectUri,
        ...(idToken && { id_token_hint: idToken }),
      }).href;
    }
  } catch (err) {
    log.error('Failed to build OIDC logout URL', err);
  }
  return config.oidc.postLogoutRedirectUri;
}
