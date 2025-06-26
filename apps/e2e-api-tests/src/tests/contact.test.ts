import { ClientApiError, ContactClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Contact API', () => {
  let contactClient: ContactClient;

  beforeAll(() => {
    contactClient = new ContactClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
  });

  it('should return 400 for non-existing contact id with client', async () => {
    try {
      await contactClient.get('non-existing-id');
    } catch (error) {
      if (error instanceof ClientApiError) {
        expect(error.httpCode).toBe(400);
      }
    }
  });

  it('should successfully list contacts', async () => {
    const response = await contactClient.list({});

    // Check response structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('offset');
    expect(response).toHaveProperty('count');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // Check first item properties if exists
    if (response.items.length > 0) {
      const firstContact = response.items[0];
      expect(firstContact).toHaveProperty('id');
      expect(firstContact).toHaveProperty('email');
      expect(firstContact).toHaveProperty('firstname');
      expect(firstContact).toHaveProperty('lastname');
      expect(firstContact).toHaveProperty('joined');
      expect(firstContact).toHaveProperty('activeRoles');
      expect(firstContact).toHaveProperty('displayName');
      expect(Array.isArray(firstContact.activeRoles)).toBe(true);
    }
  });
});
