import { GetContactWith } from '@beabee/beabee-common';
import { ClientApiError, ContactClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Contact API', () => {
  let contactClient: ContactClient;
  let testContactId: string;

  beforeAll(() => {
    contactClient = new ContactClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const newContact = {
        email: `test-${Date.now()}@example.com`,
        firstname: 'Test',
        lastname: 'User',
        password: 'testPassword123!',
      };

      const response = await contactClient.create(newContact);
      testContactId = response.id;

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.email).toBe(newContact.email);
      expect(response.firstname).toBe(newContact.firstname);
      expect(response.lastname).toBe(newContact.lastname);
      expect(response.displayName).toBe(
        `${newContact.firstname} ${newContact.lastname}`
      );
      expect(response.joined).toBeInstanceOf(Date);
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

  describe('get', () => {
    it('should get a contact by id', async () => {
      const response = await contactClient.get(testContactId);

      expect(response).toBeDefined();
      expect(response.id).toBe(testContactId);
      expect(response.displayName).toBeDefined();
    });

    it('should get a contact with roles', async () => {
      const response = await contactClient.get(testContactId, [
        GetContactWith.Roles,
      ]);

      expect(response).toBeDefined();
      expect(response.id).toBe(testContactId);
      expect(response.roles).toBeDefined();
      expect(Array.isArray(response.roles)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
      const updateData = {
        firstname: 'Updated',
        lastname: 'Name',
      };

      const response = await contactClient.update(testContactId, updateData);

      expect(response).toBeDefined();
      expect(response.firstname).toBe(updateData.firstname);
      expect(response.lastname).toBe(updateData.lastname);
      expect(response.displayName).toBe(
        `${updateData.firstname} ${updateData.lastname}`
      );
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      await expect(
        contactClient.delete(testContactId)
      ).resolves.toBeUndefined();
      await expect(contactClient.get(testContactId)).rejects.toThrow();
    });
  });
});
