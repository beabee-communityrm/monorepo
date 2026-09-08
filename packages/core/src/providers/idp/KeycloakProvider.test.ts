import { afterEach, describe, expect, it, vi } from 'vitest';

import { KeycloakProvider } from './KeycloakProvider';

const settings = {
  url: 'http://auth.localhost:3080',
  realm: 'beabee',
  clientId: 'beabee-provisioning',
  clientSecret: 'secret',
};

function mockFetch(...responses: Response[]): ReturnType<typeof vi.fn> {
  const fn = vi.fn();
  for (const resp of responses) {
    fn.mockResolvedValueOnce(resp);
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

function tokenResponse(): Response {
  return new Response(
    JSON.stringify({ access_token: 'token123', expires_in: 300 })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Only the provider's own logic is tested here; the Keycloak API contract is
// verified against a real instance, see docs/oidc-local-development.md
describe('KeycloakProvider', () => {
  it('caches the access token until it expires', async () => {
    const fetch = mockFetch(
      tokenResponse(),
      new Response(JSON.stringify([])),
      new Response(JSON.stringify([]))
    );

    const provider = new KeycloakProvider(settings);
    await provider.findUserByEmail('a@example.com');
    await provider.findUserByEmail('b@example.com');

    // One token request plus two API requests
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('refuses to pick between multiple matches', async () => {
    mockFetch(
      tokenResponse(),
      new Response(JSON.stringify([{ id: 'sub-1' }, { id: 'sub-2' }]))
    );

    const provider = new KeycloakProvider(settings);
    await expect(provider.findUserByEmail('test@example.com')).rejects.toThrow(
      'Multiple Keycloak users match'
    );
  });
});
