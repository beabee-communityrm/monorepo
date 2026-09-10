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

  it('refuses to pick between multiple matches', async () => {
    mockFetch(
      new Response(
        JSON.stringify({ result: [{ userId: 'u1' }, { userId: 'u2' }] })
      )
    );

    const provider = new ZitadelProvider(settings);
    await expect(
      provider.findSubjectByEmail('test@example.com')
    ).rejects.toThrow('Multiple Zitadel users match');
  });

  it('accepts responses without a body', async () => {
    mockFetch(new Response(null, { status: 200 }));

    const provider = new ZitadelProvider(settings);
    await expect(
      provider.permanentlyDeleteContact('u1')
    ).resolves.toBeUndefined();
  });
});
