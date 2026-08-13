import { afterEach, describe, expect, it, vi } from 'vitest';

import { KeycloakProvider } from './KeycloakProvider';

const settings = {
  url: 'http://keycloak:3080',
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

describe('KeycloakProvider', () => {
  it('creates a user and returns the subject from the Location header', async () => {
    const fetch = mockFetch(
      tokenResponse(),
      new Response(null, {
        status: 201,
        headers: {
          location:
            'http://keycloak:3080/admin/realms/beabee/users/abc-123-def',
        },
      })
    );

    const provider = new KeycloakProvider(settings);
    const subject = await provider.createUser({
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User',
    });

    expect(subject).toBe('abc-123-def');
    expect(fetch).toHaveBeenCalledWith(
      'http://keycloak:3080/admin/realms/beabee/users',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
        }),
      })
    );
  });

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

  it('finds a user by email', async () => {
    mockFetch(tokenResponse(), new Response(JSON.stringify([{ id: 'sub-1' }])));

    const provider = new KeycloakProvider(settings);
    expect(await provider.findUserByEmail('test@example.com')).toBe('sub-1');
  });

  it('returns null when no user matches', async () => {
    mockFetch(tokenResponse(), new Response(JSON.stringify([])));

    const provider = new KeycloakProvider(settings);
    expect(await provider.findUserByEmail('missing@example.com')).toBe(null);
  });

  it('throws on API errors', async () => {
    mockFetch(
      tokenResponse(),
      new Response('User exists', { status: 409, statusText: 'Conflict' })
    );

    const provider = new KeycloakProvider(settings);
    await expect(
      provider.createUser({
        email: 'dup@example.com',
        firstname: '',
        lastname: '',
      })
    ).rejects.toThrow('Keycloak API error: POST /users returned 409');
  });
});
