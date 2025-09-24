import {
  CONTACT_MFA_TYPE,
  CreateContactMfaData,
  DeleteContactMfaData,
} from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import { API_KEY, HOST, PATH } from '@beabee/test-utils/vitest/env';

import { Secret, TOTP } from 'otpauth';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

describe('ContactMfa API', () => {
  let client: BeabeeClient;
  let testContactId: string;
  let mfaData: CreateContactMfaData;
  let totp: TOTP;

  beforeAll(async () => {
    // Create client
    client = new BeabeeClient({
      host: HOST,
      path: PATH,
      token: API_KEY,
    });

    // Create a test contact
    const newContact = {
      email: `test-mfa-${Date.now()}@example.com`,
      firstname: 'Test',
      lastname: 'MFA User',
      password: 'testPassword123!',
    };

    const contact = await client.contact.create(newContact);
    testContactId = contact.id;

    // Setup MFA data
    const secret = 'JBSWY3DPEHPK3PXP';
    totp = new TOTP({
      secret: Secret.fromBase32(secret),
    });

    mfaData = {
      type: CONTACT_MFA_TYPE.TOTP,
      secret: secret,
      token: totp.generate(),
    };
  });

  afterAll(async () => {
    // Clean up test contact
    if (testContactId) {
      try {
        await client.contact.delete(testContactId);
      } catch (error) {
        // Ignore error
      }
    }
  });

  afterEach(async () => {
    // Clean up MFA
    if (testContactId) {
      mfaData.token = totp.generate();
      try {
        await client.contact.mfa.delete(testContactId, mfaData);
      } catch (error) {
        // Ignore error
      }
    }
  });

  describe('create', () => {
    it('should create MFA for a contact', async () => {
      mfaData.token = totp.generate();
      await client.contact.mfa.create(testContactId, mfaData);
      const response = await client.contact.mfa.get(testContactId);
      expect(response).toBeDefined();
      expect(response?.type).toBe(CONTACT_MFA_TYPE.TOTP);
    });

    it('should reject invalid token', async () => {
      const invalidMfaData: CreateContactMfaData = {
        ...mfaData,
        token: '000000', // Invalid token
      };

      await expect(
        client.contact.mfa.create(testContactId, invalidMfaData)
      ).rejects.toThrow();
    });
  });

  describe('get', () => {
    it('should get MFA status for a contact', async () => {
      const response = await client.contact.mfa.get(testContactId);
      expect(response).toBeDefined();
      if (response) {
        expect(response.type).toBe(CONTACT_MFA_TYPE.TOTP);
      }
    });

    it('should return null for contact without MFA', async () => {
      // Create a new contact without MFA
      const newContact = {
        email: `test-no-mfa-${Date.now()}@example.com`,
        firstname: 'Test',
        lastname: 'No MFA',
        password: 'testPassword123!',
      };
      const contact = await client.contact.create(newContact);

      const response = await client.contact.mfa.get(contact.id);
      expect(response).toBeNull();

      // Clean up
      await client.contact.delete(contact.id);
    });
  });

  describe('delete', () => {
    it('should delete MFA for a contact', async () => {
      // First ensure MFA exists
      mfaData.token = totp.generate();
      const mfa = await client.contact.mfa.get(testContactId);
      if (!mfa?.type) {
        await client.contact.mfa.create(testContactId, mfaData);
      }

      // Then delete it
      const deleteData: DeleteContactMfaData = {
        type: CONTACT_MFA_TYPE.TOTP,
        token: totp.generate(),
      };
      await client.contact.mfa.delete(testContactId, deleteData);

      // Verify it's gone
      const response = await client.contact.mfa.get(testContactId);
      expect(response).toBeNull();
    });

    it('should reject invalid token when deleting', async () => {
      const deleteData: DeleteContactMfaData = {
        type: CONTACT_MFA_TYPE.TOTP,
        token: '000000', // Invalid token
      };

      await expect(
        client.contact.mfa.delete(testContactId, deleteData)
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should return 400 for non-existing contact id', async () => {
      try {
        await client.contact.mfa.get('non-existing-id');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.httpCode).toBe(400);
      }
    });
  });
});
