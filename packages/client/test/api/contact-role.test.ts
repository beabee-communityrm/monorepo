import {
  ContactRoleData,
  RoleTypeData,
  Serial,
  UpdateContactRoleData,
} from '@beabee/beabee-common';
import { ContactClient, ContactRoleClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { addDays } from 'date-fns';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('ContactRole API', () => {
  let contactClient: ContactClient;
  let testContactId: string;

  beforeAll(async () => {
    contactClient = new ContactClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });

    // Create a test contact
    const newContact = {
      email: `test-role-${Date.now()}@example.com`,
      firstname: 'Test',
      lastname: 'Role User',
      password: 'testPassword123!',
    };

    const response = await contactClient.create(newContact);
    testContactId = response.id;
  });

  afterAll(async () => {
    // Clean up test contact
    if (testContactId) {
      await contactClient.delete(testContactId);
    }
  });

  describe('update', () => {
    it('should update a contact role with expiration', async () => {
      const role = RoleTypeData.ADMIN;
      const updateData = {
        dateAdded: new Date(),
        dateExpires: addDays(new Date(), 30),
      };

      const result = await contactClient.role.update(
        testContactId,
        role,
        updateData
      );

      expect(result).toBeDefined();
      expect(result.role).toBe(role);
      expect(result.dateAdded).toBeInstanceOf(Date);
      expect(result.dateExpires).toBeInstanceOf(Date);
    });

    it('should keep existing expiration when dateExpires is undefined', async () => {
      const role = RoleTypeData.ADMIN;

      // First set an expiration date
      const initialExpiry = addDays(new Date(), 30);
      await contactClient.role.update(testContactId, role, {
        dateAdded: new Date(),
        dateExpires: initialExpiry,
      });

      // Then update with undefined dateExpires
      const updateData: UpdateContactRoleData = {
        dateAdded: new Date(),
      };

      const result = await contactClient.role.update(
        testContactId,
        role,
        updateData
      );

      expect(result).toBeDefined();
      expect(result.role).toBe(role);
      expect(result.dateAdded).toBeInstanceOf(Date);
      expect(result.dateExpires).toBeInstanceOf(Date);
      // The expiration date should still be set
      expect(result.dateExpires).not.toBeNull();
    });

    it('should remove expiration when dateExpires is null', async () => {
      const role = RoleTypeData.ADMIN;

      // First set an expiration date
      const initialExpiry = addDays(new Date(), 30);
      await contactClient.role.update(testContactId, role, {
        dateAdded: new Date(),
        dateExpires: initialExpiry,
      });

      // Then update with null dateExpires
      const updateData = {
        dateAdded: new Date(),
        dateExpires: null,
      };

      const result = await contactClient.role.update(
        testContactId,
        role,
        updateData
      );

      expect(result).toBeDefined();
      expect(result.role).toBe(role);
      expect(result.dateAdded).toBeInstanceOf(Date);
      // The expiration date should be null
      expect(result.dateExpires).toBeNull();
    });

    it('should reject empty string as invalid dateExpires value', async () => {
      const role = RoleTypeData.ADMIN;
      const updateData: UpdateContactRoleData = {
        dateAdded: new Date(),
        dateExpires: '' as any,
      };

      await expect(
        contactClient.role.update(testContactId, role, updateData)
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a contact role', async () => {
      const role = RoleTypeData.ADMIN;
      await expect(
        contactClient.role.delete(testContactId, role)
      ).resolves.toBeUndefined();
    });
  });

  describe('deserialize', () => {
    it('should correctly deserialize role data with expiration', () => {
      const now = new Date();
      const expires = addDays(now, 30);

      const serializedData = {
        role: RoleTypeData.ADMIN,
        dateAdded: now.toISOString(),
        dateExpires: expires.toISOString(),
      };

      const result = ContactRoleClient.deserialize(serializedData);

      expect(result.role).toBe(RoleTypeData.ADMIN);
      expect(result.dateAdded).toBeInstanceOf(Date);
      expect(result.dateExpires).toBeInstanceOf(Date);
      expect(result.dateAdded?.toISOString()).toBe(now.toISOString());
      expect(result.dateExpires?.toISOString()).toBe(expires.toISOString());
    });

    it('should correctly deserialize role data without expiration', () => {
      const now = new Date();

      const serializedData: Serial<ContactRoleData> = {
        role: RoleTypeData.ADMIN,
        dateAdded: now.toISOString(),
        dateExpires: '',
      };

      const result = ContactRoleClient.deserialize(serializedData);

      expect(result.role).toBe(RoleTypeData.ADMIN);
      expect(result.dateAdded).toBeInstanceOf(Date);
      expect(result.dateExpires).toBeNull();
      expect(result.dateAdded?.toISOString()).toBe(now.toISOString());
    });
  });
});
