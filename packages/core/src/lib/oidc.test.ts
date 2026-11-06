import { afterEach, describe, expect, it, vi } from 'vitest';

const audience = 'https://beabee.example.org';
const redirectUri = audience + '/api/1.0/auth/callback';
const postLogoutRedirectUri = audience + '/api/1.0/auth/logout/callback';

const settings = {
  issuer: 'https://idp.example.org',
  clientId: 'beabee',
  clientSecret: '',
  scopes: 'openid profile email',
};

const mockConfig = {
  dev: false,
  audience,
  login: { provider: 'oidc', settings },
  siteLogin: undefined as object | undefined,
};

vi.mock('#config/config', () => ({ default: mockConfig }));

const {
  discovery,
  authorizationCodeGrant,
  refreshTokenGrant,
  tokenRevocation,
  AuthorizationResponseError,
  ResponseBodyError,
} = vi.hoisted(() => ({
  discovery: vi.fn(),
  authorizationCodeGrant: vi.fn(),
  refreshTokenGrant: vi.fn(),
  tokenRevocation: vi.fn(),
  AuthorizationResponseError: class extends Error {
    constructor(
      readonly error: string,
      readonly error_description?: string
    ) {
      super(error);
    }
  },
  ResponseBodyError: class extends Error {
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
  refreshTokenGrant,
  tokenRevocation,
  randomPKCECodeVerifier: () => 'verifier',
  calculatePKCECodeChallenge: async () => 'challenge',
  randomState: () => 'state',
  randomNonce: () => 'nonce',
  buildAuthorizationUrl: (_: unknown, params: Record<string, string>) =>
    new URL('https://idp.example.org/authorize?' + new URLSearchParams(params)),
  buildEndSessionUrl: (_: unknown, params: Record<string, string>) =>
    new URL(
      'https://idp.example.org/end_session?' + new URLSearchParams(params)
    ),
  None: () => 'none',
  ClientSecretBasic: () => 'basic',
  allowInsecureRequests: () => {},
  AuthorizationResponseError,
  ResponseBodyError,
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
  mockConfig.siteLogin = undefined;
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
      postLogoutRedirectUri
    );
  });

  it('carries next through the IdP as state', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    const { getOidcLogoutUrl } = await load();

    const url = new URL(
      await getOidcLogoutUrl('id-token', 'https://www.example.org/x')
    );
    expect(url.searchParams.get('state')).toBe('https://www.example.org/x');
  });

  it('appends the state to the fallback without an end-session endpoint', async () => {
    discovery.mockResolvedValueOnce(withoutEndSession);
    const { getOidcLogoutUrl } = await load();

    await expect(getOidcLogoutUrl('id-token', '/x')).resolves.toBe(
      postLogoutRedirectUri + '?state=%2Fx'
    );
  });

  it('falls back to the post-logout URI without an end-session endpoint', async () => {
    discovery.mockResolvedValueOnce(withoutEndSession);
    const { getOidcLogoutUrl } = await load();

    await expect(getOidcLogoutUrl('id-token')).resolves.toBe(
      postLogoutRedirectUri
    );
  });

  it('retries discovery after a failure', async () => {
    discovery
      .mockRejectedValueOnce(new Error('IdP unreachable'))
      .mockResolvedValueOnce(withEndSession);
    const { getOidcLogoutUrl } = await load();

    await expect(getOidcLogoutUrl()).resolves.toBe(postLogoutRedirectUri);
    await expect(getOidcLogoutUrl()).resolves.toContain('/end_session');
    expect(discovery).toHaveBeenCalledTimes(2);
  });
});

describe('startOidcLogin', () => {
  it('builds the authorization URL and the state for the callback', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    const { startOidcLogin } = await load();

    const { url, loginState } = await startOidcLogin('/profile');
    const params = new URL(url).searchParams;
    expect(params.get('redirect_uri')).toBe(redirectUri);
    expect(params.get('scope')).toBe(settings.scopes);
    expect(params.get('code_challenge')).toBe('challenge');
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('state')).toBe('state');
    expect(params.get('nonce')).toBe('nonce');
    expect(params.has('prompt')).toBe(false);
    expect(loginState).toEqual({
      state: 'state',
      nonce: 'nonce',
      codeVerifier: 'verifier',
      next: '/profile',
      prompt: undefined,
    });
  });

  it('asks for a refresh token only with Site Login', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    mockConfig.siteLogin = { cookieName: 'login' };
    const { startOidcLogin } = await load();

    const { url } = await startOidcLogin('/profile');
    expect(new URL(url).searchParams.get('scope')).toBe(
      settings.scopes + ' offline_access'
    );
  });

  it('asks for prompt=login for a fresh login', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    const { startOidcLogin } = await load();

    const { url, loginState } = await startOidcLogin('/profile', 'login');
    expect(new URL(url).searchParams.get('prompt')).toBe('login');
    expect(loginState.prompt).toBe('login');
  });
});

describe('completeOidcLogin', () => {
  it('returns the subject and ID token of the logged-in member', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    authorizationCodeGrant.mockResolvedValueOnce({
      id_token: 'id-token',
      refresh_token: 'refresh-token',
      claims: () => ({ sub: 'subject-1', auth_time: 1700000000 }),
    });
    const { completeOidcLogin } = await load();

    await expect(
      completeOidcLogin('?code=abc&state=state', loginState)
    ).resolves.toEqual({
      subject: 'subject-1',
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      authTime: 1700000000,
    });

    const [, callbackUrl, checks] = authorizationCodeGrant.mock.calls[0];
    expect(callbackUrl.href).toBe(redirectUri + '?code=abc&state=state');
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

describe('refreshOidcLogin', () => {
  it('returns the renewed ID token and the rotated refresh token', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    refreshTokenGrant.mockResolvedValueOnce({
      id_token: 'id-token-2',
      refresh_token: 'refresh-token-2',
    });
    const { refreshOidcLogin } = await load();

    await expect(refreshOidcLogin('refresh-token-1')).resolves.toEqual({
      idToken: 'id-token-2',
      refreshToken: 'refresh-token-2',
    });
    expect(refreshTokenGrant.mock.calls[0][1]).toBe('refresh-token-1');
  });

  it('keeps the refresh token when the IdP does not rotate it', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    refreshTokenGrant.mockResolvedValueOnce({ id_token: 'id-token-2' });
    const { refreshOidcLogin } = await load();

    await expect(refreshOidcLogin('refresh-token-1')).resolves.toEqual({
      idToken: 'id-token-2',
      refreshToken: 'refresh-token-1',
    });
  });

  it('returns null when the IdP rejects the refresh token', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    refreshTokenGrant.mockRejectedValueOnce(
      new ResponseBodyError('invalid_request', 'RefreshTokenInvalid')
    );
    const { refreshOidcLogin } = await load();

    await expect(refreshOidcLogin('spent')).resolves.toBeNull();
  });

  it('throws when the IdP is unreachable', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    refreshTokenGrant.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const { refreshOidcLogin } = await load();

    await expect(refreshOidcLogin('refresh-token-1')).rejects.toThrow(
      'ECONNREFUSED'
    );
  });

  it('rejects a refresh response without an ID token', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    refreshTokenGrant.mockResolvedValueOnce({ access_token: 'access' });
    const { refreshOidcLogin } = await load();

    await expect(refreshOidcLogin('refresh-token-1')).rejects.toThrow(
      'did not include an ID token'
    );
  });
});

describe('revokeOidcRefreshToken', () => {
  it('revokes the token with its type hint', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    const { revokeOidcRefreshToken } = await load();

    await revokeOidcRefreshToken('refresh-token-1');
    expect(tokenRevocation.mock.calls[0].slice(1)).toEqual([
      'refresh-token-1',
      { token_type_hint: 'refresh_token' },
    ]);
  });

  it('does not fail the logout when the revocation fails', async () => {
    discovery.mockResolvedValueOnce(withEndSession);
    tokenRevocation.mockRejectedValueOnce(new Error('IdP unreachable'));
    const { revokeOidcRefreshToken } = await load();

    await expect(revokeOidcRefreshToken('refresh-token-1')).resolves.toBe(
      undefined
    );
  });
});
