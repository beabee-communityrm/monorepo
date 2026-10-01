import type { CreateApiKeyData } from '@beabee/beabee-common';
import {
  ApiKeyClient,
  AuthClient,
  ContactClient,
  ResetSecurityClient,
} from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import jwt from 'jsonwebtoken';
import { beforeAll, describe, expect, it } from 'vitest';

// The same secret the test stack's api_app runs with (see .env.test)
const serviceSecret = process.env.BEABEE_SERVICE_SECRET;

/** Mint an Operator Auth token the way the backend CLI will */
function operatorToken(opts: { secret?: string; ageSeconds?: number } = {}) {
  if (!serviceSecret) {
    throw new Error('BEABEE_SERVICE_SECRET must be set to run these tests');
  }
  return jwt.sign(
    { iat: Math.floor(Date.now() / 1000) - (opts.ageSeconds ?? 0) },
    opts.secret ?? serviceSecret,
    { algorithm: 'HS256', issuer: 'operator' }
  );
}

describe('Operator Auth', () => {
  let contactId: string;

  beforeAll(async () => {
    const contactClient = new ContactClient({
      host: api.host,
      path: api.path,
      token: operatorToken(),
    });
    const { items } = await contactClient.list({
      rules: {
        condition: 'AND',
        rules: [{ field: 'email', operator: 'equal', value: [testUser.email] }],
      },
    });
    contactId = items[0].id;
  });

  it('rejects a token signed with the wrong secret', async () => {
    const authClient = new AuthClient({
      host: api.host,
      path: api.path,
      token: operatorToken({ secret: 'not the service secret' }),
    });
    const info = await authClient.info();
    expect(info.method).toBe('none');
  });

  it('rejects a token older than a minute', async () => {
    const authClient = new AuthClient({
      host: api.host,
      path: api.path,
      token: operatorToken({ ageSeconds: 120 }),
    });
    const info = await authClient.info();
    expect(info.method).toBe('none');
  });

  it('accepts a fresh token as operator with every role', async () => {
    const authClient = new AuthClient({
      host: api.host,
      path: api.path,
      token: operatorToken(),
    });
    const info = await authClient.info();
    expect(info.method).toBe('operator');
    expect(info.roles).toEqual(['admin', 'superadmin']);
    expect(info.contact).toBeUndefined();
  });

  it('creates an API key for another contact', async () => {
    const apiKeyClient = new ApiKeyClient({
      host: api.host,
      path: api.path,
      token: operatorToken(),
    });
    const newKeyData: CreateApiKeyData = {
      description: 'Operator-created key',
      expires: null,
      contactId,
    };
    const { token } = await apiKeyClient.create(newKeyData);
    expect(typeof token).toBe('string');

    const { items } = await apiKeyClient.list({});
    const created = items.find((k) => k.description === newKeyData.description);
    expect(created?.creator.id).toBe(contactId);
    await apiKeyClient.delete(created!.id);
  });

  it('returns the reset password link instead of sending an email', async () => {
    const resetClient = new ResetSecurityClient({
      host: api.host,
      path: api.path,
      token: operatorToken(),
    });
    const link = await resetClient.resetPasswordBegin(testUser.email);
    expect(link?.resetUrl).toMatch(
      new RegExp(`^${api.host}/auth/reset-password/[0-9a-f-]{36}$`)
    );
  });
});
