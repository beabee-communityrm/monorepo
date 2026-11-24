import http from 'node:http';
import { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('#config/config', () => {
  const config = { logFormat: 'json' };
  return { default: config, config };
});

const { createInstance, identityFields } = await import('./salesforce');

const SECRET = 'very-secret-client-secret';

let server: http.Server | undefined;

afterEach(() => server?.close());

async function startServer(
  handler: http.RequestListener
): Promise<{ baseUrl: string; hits: string[] }> {
  const hits: string[] = [];
  server = http.createServer((req, res) => {
    hits.push(req.url ?? '');
    handler(req, res);
  });
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { baseUrl, hits };
}

describe('createInstance', () => {
  it('fails once without the client secret when the token request fails', async () => {
    const { baseUrl, hits } = await startServer((req, res) => {
      res.statusCode = 401;
      res.end('{"error":"invalid_client"}');
    });
    const instance = createInstance({
      authUrl: `${baseUrl}/token`,
      clientId: 'client',
      clientSecret: SECRET,
    });

    const error = await instance.get('sobjects').catch((err) => err);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(
      'Salesforce token request failed with status 401: {"error":"invalid_client"}'
    );
    expect(JSON.stringify(error)).not.toContain(SECRET);
    expect(hits).toEqual(['/token']);
  });

  it('retries once with a new token after a 401', async () => {
    let tokens = 0;
    const { baseUrl, hits } = await startServer((req, res) => {
      if (req.url === '/token') {
        tokens++;
        res.end(
          JSON.stringify({ access_token: `t${tokens}`, instance_url: baseUrl })
        );
      } else {
        res.statusCode = req.headers.authorization === 'Bearer t2' ? 200 : 401;
        res.end('{}');
      }
    });
    const instance = createInstance({
      authUrl: `${baseUrl}/token`,
      clientId: 'client',
      clientSecret: SECRET,
    });

    const resp = await instance.get('sobjects');

    expect(resp.status).toBe(200);
    expect(hits).toEqual([
      '/token',
      '/services/data/v60.0/sobjects',
      '/token',
      '/services/data/v60.0/sobjects',
    ]);
  });
});

describe('identityFields', () => {
  const contact = {
    email: 'ada@example.com',
    firstname: 'Ada',
    lastname: 'L'.repeat(60),
  };

  it('cuts values to the field lengths', () => {
    expect(identityFields(contact)).toEqual({
      Name: ('Ada ' + 'L'.repeat(60)).slice(0, 80),
      EMail_bee__c: 'ada@example.com',
      FirstName_bee__c: 'Ada',
      LastName_bee__c: 'L'.repeat(50),
    });
  });

  it('falls back to the email as name', () => {
    expect(
      identityFields({ ...contact, firstname: '', lastname: '' }).Name
    ).toBe('ada@example.com');
  });
});
