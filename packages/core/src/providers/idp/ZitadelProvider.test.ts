import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Contact } from '#models/index';

import { ZitadelProvider } from './ZitadelProvider';

const settings = {
  url: 'https://auth.example.org',
  pat: 'pat123',
};

function mockFetch(...responses: Response[]): ReturnType<typeof vi.fn> {
  const fn = vi.fn();
  for (const resp of responses) {
    fn.mockResolvedValueOnce(resp);
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// Only the provider's own logic is tested here; the Zitadel API contract is
// verified against a real instance
describe('ZitadelProvider', () => {
  it('fills in the names Zitadel requires when the contact has none', async () => {
    const fetch = mockFetch(new Response(JSON.stringify({ userId: 'u1' })));

    const provider = new ZitadelProvider(settings);
    // Only the mirrored fields matter to the provider
    await provider.createContact({
      email: 'test@example.com',
      firstname: '',
      lastname: '',
    } as Contact);

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.profile).toEqual({
      givenName: 'test@example.com',
      familyName: '-',
      displayName: 'test@example.com',
    });
  });

  it('lists the password, ready passkeys and second factors as login methods', async () => {
    mockFetch(
      new Response(
        JSON.stringify({
          authMethodTypes: [
            'AUTHENTICATION_METHOD_TYPE_PASSWORD',
            'AUTHENTICATION_METHOD_TYPE_PASSKEY',
          ],
        })
      ),
      new Response(
        JSON.stringify({
          result: [
            { id: 'p1', state: 'AUTH_FACTOR_STATE_READY', name: 'Laptop' },
            { id: 'p2', state: 'AUTH_FACTOR_STATE_NOT_READY', name: 'Phone' },
          ],
        })
      ),
      new Response(
        JSON.stringify({
          result: [
            { state: 'AUTH_FACTOR_STATE_READY', otp: {} },
            {
              state: 'AUTH_FACTOR_STATE_READY',
              u2f: { id: 'k1', name: 'YubiKey' },
            },
          ],
        })
      )
    );

    const provider = new ZitadelProvider(settings);
    await expect(provider.listAuthMethods('u1')).resolves.toEqual([
      { id: 'password', type: 'password' },
      { id: 'passkey-p1', type: 'passkey', name: 'Laptop' },
      { id: 'totp', type: 'authenticatorApp' },
      { id: 'u2f-k1', type: 'securityKey', name: 'YubiKey' },
    ]);
  });

  it('maps a method ID to its removal endpoint', async () => {
    const fetch = mockFetch(
      new Response(null, { status: 200 }),
      new Response(null, { status: 200 }),
      new Response(null, { status: 200 })
    );

    const provider = new ZitadelProvider(settings);
    await provider.removeAuthMethod('u1', 'passkey-p1');
    await provider.removeAuthMethod('u1', 'u2f-k1');
    await provider.removeAuthMethod('u1', 'totp');

    expect(fetch.mock.calls.map((call) => call[0])).toEqual([
      'https://auth.example.org/v2/users/u1/passkeys/p1',
      'https://auth.example.org/v2/users/u1/u2f/k1',
      'https://auth.example.org/v2/users/u1/totp',
    ]);
    await expect(provider.removeAuthMethod('u1', 'password')).rejects.toThrow(
      'cannot be removed'
    );
  });

  it('accepts responses without a body', async () => {
    mockFetch(new Response(null, { status: 200 }));

    const provider = new ZitadelProvider(settings);
    await expect(
      provider.permanentlyDeleteContact('u1')
    ).resolves.toBeUndefined();
  });
});
