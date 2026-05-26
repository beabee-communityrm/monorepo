import type {
  CreateApiKeyData,
  GetApiKeyData,
  Paginated,
} from '@beabee/beabee-common';
import { ApiKeyClient, AuthClient } from '@beabee/client';
import {
  HOST,
  PATH,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
} from '@beabee/test-utils/vitest/env';

import { addDays } from 'date-fns';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('ApiKey API', () => {
  let apiKeyClient: ApiKeyClient;
  let authUserClient: AuthClient;
  beforeAll(async () => {
    authUserClient = new AuthClient({
      host: HOST,
      path: PATH,
    });
    // For testing api keys we need to login as user
    await authUserClient.login({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    apiKeyClient = new ApiKeyClient({
      host: HOST,
      path: PATH,
    });
  });

  afterAll(async () => {
    await authUserClient.logout();
  });

  it('should create an API key with expiration', async () => {
    const newKeyData: CreateApiKeyData = {
      description: 'Test API Key',
      expires: addDays(new Date(), 30),
    };
    const response = await apiKeyClient.create(newKeyData);
    expect(response).toBeDefined();
    expect(response.token).toBeDefined();
    expect(typeof response.token).toBe('string');
  });

  it('should create an API key without expiration', async () => {
    const newKeyData: CreateApiKeyData = {
      description: 'Test API Key Never Expires',
      expires: null,
    };

    const response = await apiKeyClient.create(newKeyData);
    expect(response).toBeDefined();
    expect(response.token).toBeDefined();
    expect(typeof response.token).toBe('string');
  });

  it('should list API keys with pagination', async () => {
    let response: Paginated<GetApiKeyData>;
    try {
      response = await apiKeyClient.list({
        limit: 10,
        offset: 0,
        order: 'DESC',
        sort: 'createdAt',
      });
    } catch (error) {
      console.error('Error listing API keys', error);
      throw error;
    }

    // Check pagination structure
    expect(response).toBeDefined();
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('offset');
    expect(response).toHaveProperty('count');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // Check item structure if any exist
    if (response.items.length > 0) {
      const firstKey = response.items[0];
      expect(firstKey).toHaveProperty('id');
      expect(firstKey).toHaveProperty('description');
      expect(firstKey).toHaveProperty('createdAt');
      expect(firstKey.createdAt).toBeInstanceOf(Date);
      // expires can be null or Date
      if (firstKey.expires) {
        expect(firstKey.expires).toBeInstanceOf(Date);
      }
    }
  });

  it('should delete an API key', async () => {
    // First create a key to delete
    const newKeyData: CreateApiKeyData = {
      description: 'Test API Key to Delete',
      expires: addDays(new Date(), 1),
    };

    // Create new key
    const { token } = await apiKeyClient.create(newKeyData);
    expect(token).toBeDefined();

    // Get list to find the ID of the new key
    const { items } = await apiKeyClient.list({});
    const keyToDelete = items.find(
      (key) => key.description === newKeyData.description
    );

    if (!keyToDelete) {
      throw new Error('Could not find created key');
    }

    // Delete the key
    await apiKeyClient.delete(keyToDelete.id);

    // Verify key is deleted by checking the list
    const { items: updatedItems } = await apiKeyClient.list({});
    const deletedKey = updatedItems.find((key) => key.id === keyToDelete.id);
    expect(deletedKey).toBeUndefined();
  });
});
