import { afterEach, describe, expect, it, vi } from 'vitest';

const settings = {
  issuer: 'https://idp.example.org',
  clientId: 'beabee',
  clientSecret: '',
  scopes: 'openid profile email',
  redirectUri: 'https://beabee.example.org/api/1.0/auth/callback',
  postLogoutRedirectUri: 'https://beabee.example.org',
};

vi.mock('#config/config', () => ({
  default: { dev: false, login: { provider: 'oidc', settings } },
}));

const { discovery, authorizationCodeGrant, AuthorizationResponseError } =
  vi.hoisted(() => ({
    discovery: vi.fn(),
    authorizationCodeGrant: vi.fn(),
    AuthorizationResponseError: class extends Error {
      constructor(
        readonly error: string,
        readonly error_description?: string
      ) {
        super(error);
      }
    },
  }));

vi.mock('openid-client', () => ({
  discovery,
  authorizationCodeGrant,
  buildEndSessionUrl: (_: unknown, params: Record<string, string>) =>
    new URL(
      'https://idp.example.org/end_session?' + new URLSearchParams(params)
    ),
  None: () => 'none',
  ClientSecretBasic: () => 'basic',
  allowInsecureRequests: () => {},
  AuthorizationResponseError,
}));

const withEndSession = {
  serverMetadata: () => ({
    end_session_endpoint: 'https://idp.example.org/end_session',
  }),
};
const withoutEndSession = { serverMetadata: () => ({}) };

// Each test gets a fresh module so the discovery cache starts empty
async function load() {
  vi.resetModules();
  return await import('./oidc');
}

const loginState = { codeVerifier: 'verifier', state: 'state', nonce: 'nonce' };

afterEach(() => {
  vi.clearAllMocks();
});

describe('getOidcLogoutUrl', () => {
  it('builds the end-session URL with the ID token as hint', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    const { getOidcLogoutUrl } = await load();

    const url = new URL(await getOidcLogoutUrl('id-token'));
    expect(url.origin + url.pathname).toBe(
      'https://idp.example.org/end_session'
    );
    expect(url.searchParams.get('id_token_hint')).toBe('id-token');
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe(
      settings.postLogoutRedirectUri
    );
  });

  it('sends the browser to a given post-logout URI instead', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    const { getOidcLogoutUrl } = await load();

    const url = new URL(
      await getOidcLogoutUrl(
        'id-token',
        'https://beabee.example.org/auth/login?error=unlinked-account'
      )
    );
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe(
      'https://beabee.example.org/auth/login?error=unlinked-account'
    );
  });

  it('falls back to the post-logout URI without an end-session endpoint', async () => {
    discovery.mockResolvedValueOnce(withoutEndSession);
    const { getOidcLogoutUrl } = await load();

    await expect(getOidcLogoutUrl('id-token')).resolves.toBe(
      settings.postLogoutRedirectUri
    );
  });

  it('retries discovery after a failure', async () => {
    discovery
      .mockRejectedValueOnce(new Error('IdP unreachable'))
      .mockResolvedValueOnce(withEndSession);
    const { getOidcLogoutUrl } = await load();

    await expect(getOidcLogoutUrl()).resolves.toBe(
      settings.postLogoutRedirectUri
    );
    await expect(getOidcLogoutUrl()).resolves.toContain('/end_session');
    expect(discovery).toHaveBeenCalledTimes(2);
  });
});

describe('completeOidcLogin', () => {
  it('returns the subject and ID token of the logged-in member', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    authorizationCodeGrant.mockResolvedValueOnce({
      id_token: 'id-token',
      claims: () => ({ sub: 'subject-1' }),
    });
    const { completeOidcLogin } = await load();

    await expect(
      completeOidcLogin('?code=abc&state=state', loginState)
    ).resolves.toEqual({ subject: 'subject-1', idToken: 'id-token' });

    const [, callbackUrl, checks] = authorizationCodeGrant.mock.calls[0];
    expect(callbackUrl.href).toBe(
      settings.redirectUri + '?code=abc&state=state'
    );
    expect(checks).toMatchObject({
      pkceCodeVerifier: 'verifier',
      expectedState: 'state',
      expectedNonce: 'nonce',
    });
  });

  it('reports a login the member cancelled at the IdP', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    authorizationCodeGrant.mockRejectedValueOnce(
      new AuthorizationResponseError('access_denied', 'User cancelled')
    );
    const { completeOidcLogin } = await load();

    await expect(
      completeOidcLogin('?error=access_denied&state=state', loginState)
    ).rejects.toThrow(
      'OIDC login denied by the identity provider: access_denied (User cancelled)'
    );
  });

  it('rejects a token response without an ID token', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    authorizationCodeGrant.mockResolvedValueOnce({ claims: () => undefined });
    const { completeOidcLogin } = await load();

    await expect(
      completeOidcLogin('?code=abc&state=state', loginState)
    ).rejects.toThrow('did not include an ID token');
  });
});
