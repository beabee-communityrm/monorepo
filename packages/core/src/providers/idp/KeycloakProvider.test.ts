import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Contact } from '#models/index';

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
      new Response(null, { status: 204 }),
      new Response(null, { status: 204 })
    );

    const provider = new KeycloakProvider(settings);
    await provider.permanentlyDeleteContact('sub-1');
    await provider.permanentlyDeleteContact('sub-2');

    // One token request plus two API requests
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('rejects a creation response without the new user location', async () => {
    mockFetch(tokenResponse(), new Response(null, { status: 201 }));

    const provider = new KeycloakProvider(settings);
    // Only the mirrored fields matter to the provider
    await expect(
      provider.createContact({
        email: 'test@example.com',
        firstname: '',
        lastname: '',
      } as Contact)
    ).rejects.toThrow('did not return the new user location');
  });
});
