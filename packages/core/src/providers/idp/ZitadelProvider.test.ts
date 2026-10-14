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

  describe('setup', () => {
    const json = (body: object) => new Response(JSON.stringify(body));
    const oidcClient = {
      issuer: settings.url,
      clientId: 'client-1',
      redirectUris: ['https://beabee.example.org/api/1.0/auth/callback'],
      postLogoutRedirectUris: [
        'https://beabee.example.org/api/1.0/auth/logout/callback',
      ],
    };
    // Fresh responses per test, a body can only be read once
    const policies = () => [json({ policy: {} }), json({}), json({})];
    const app = (oidcConfig: object) =>
      json({ result: [{ id: 'app-1', oidcConfig }] });

    it('rewrites the client URI lists when they differ', async () => {
      const fetch = mockFetch(
        ...policies(),
        json({ result: [{ id: 'project-1' }] }),
        app({
          clientId: 'client-1',
          redirectUris: ['https://beabee.example.org/api/1.0/auth/callback'],
          postLogoutRedirectUris: ['https://beabee.example.org'],
          appType: 'OIDC_APP_TYPE_WEB',
          version: 'OIDC_VERSION_1_0',
        }),
        json({})
      );

      const provider = new ZitadelProvider(settings);
      await provider.setup({ defaultRedirectUri: 'https://x', oidcClient });

      const [url, init] = fetch.mock.calls[5];
      expect(url).toBe(
        settings.url +
          '/management/v1/projects/project-1/apps/app-1/oidc_config'
      );
      expect(init.method).toBe('PUT');
      expect(JSON.parse(init.body)).toEqual({
        appType: 'OIDC_APP_TYPE_WEB',
        redirectUris: oidcClient.redirectUris,
        postLogoutRedirectUris: oidcClient.postLogoutRedirectUris,
      });
    });

    it('leaves a client alone whose lists already match', async () => {
      const fetch = mockFetch(
        ...policies(),
        json({ result: [{ id: 'project-1' }] }),
        app({
          clientId: 'client-1',
          redirectUris: oidcClient.redirectUris,
          postLogoutRedirectUris: [
            ...oidcClient.postLogoutRedirectUris,
          ].reverse(),
        })
      );

      const provider = new ZitadelProvider(settings);
      await provider.setup({ defaultRedirectUri: 'https://x', oidcClient });

      expect(fetch).toHaveBeenCalledTimes(5);
    });

    it('skips a client registered at another issuer', async () => {
      const fetch = mockFetch(...policies());

      const provider = new ZitadelProvider(settings);
      await provider.setup({
        defaultRedirectUri: 'https://x',
        oidcClient: { ...oidcClient, issuer: 'https://other.example.org' },
      });

      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('fails when the client is not found', async () => {
      mockFetch(
        ...policies(),
        json({ result: [{ id: 'project-1' }] }),
        app({ clientId: 'someone-else' })
      );

      const provider = new ZitadelProvider(settings);
      await expect(
        provider.setup({ defaultRedirectUri: 'https://x', oidcClient })
      ).rejects.toThrow('OIDC client client-1 not found');
    });
  });

  it('accepts responses without a body', async () => {
    mockFetch(new Response(null, { status: 200 }));

    const provider = new ZitadelProvider(settings);
    await expect(
      provider.permanentlyDeleteContact('u1')
    ).resolves.toBeUndefined();
  });
});
