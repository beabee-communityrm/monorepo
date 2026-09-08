import { afterEach, describe, expect, it, vi } from 'vitest';

import { KeycloakProvider } from './KeycloakProvider';

const settings = {
  url: 'http://auth:3080',
  realm: 'beabee',
  clientId: 'beabee-provisioning',
  clientSecret: 'secret',
};

const user = {
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'User',
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
          location: 'http://auth:3080/admin/realms/beabee/users/abc-123-def',
        },
      })
    );

    const provider = new KeycloakProvider(settings);
    expect(await provider.createUser(user)).toBe('abc-123-def');
    expect(fetch).toHaveBeenCalledWith(
      'http://auth:3080/admin/realms/beabee/users',
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
    expect(await provider.findUserByEmail(user.email)).toBe('sub-1');
  });

  it('returns null when no user matches', async () => {
    mockFetch(tokenResponse(), new Response(JSON.stringify([])));

    const provider = new KeycloakProvider(settings);
    expect(await provider.findUserByEmail('missing@example.com')).toBe(null);
  });

  it('refuses to pick between multiple matches', async () => {
    mockFetch(
      tokenResponse(),
      new Response(JSON.stringify([{ id: 'sub-1' }, { id: 'sub-2' }]))
    );

    const provider = new KeycloakProvider(settings);
    await expect(provider.findUserByEmail(user.email)).rejects.toThrow(
      'Multiple Keycloak users match'
    );
  });

  it('updates username along with the email', async () => {
    const fetch = mockFetch(
      tokenResponse(),
      new Response(null, { status: 204 })
    );

    const provider = new KeycloakProvider(settings);
    await provider.updateUser('sub-1', { ...user, email: 'new@example.com' });

    expect(fetch).toHaveBeenLastCalledWith(
      'http://auth:3080/admin/realms/beabee/users/sub-1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          username: 'new@example.com',
          email: 'new@example.com',
          firstName: 'Test',
          lastName: 'User',
          emailVerified: true,
        }),
      })
    );
  });

  it('throws on API errors', async () => {
    mockFetch(
      tokenResponse(),
      new Response('User exists', { status: 409, statusText: 'Conflict' })
    );

    const provider = new KeycloakProvider(settings);
    await expect(provider.createUser(user)).rejects.toThrow(
      'Keycloak API error: POST /users returned 409'
    );
  });
});
