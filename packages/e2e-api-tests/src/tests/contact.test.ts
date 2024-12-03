import { describe, beforeAll } from "@jest/globals";
import { ClientApiError, ContactClient } from '@beabee/client';

import { API_KEY, HOST, PATH } from './utils/env.js';

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
      await contactClient.get("non-existing-id");
    } catch (error) {
      if (error instanceof ClientApiError) {
        expect(error.httpCode).toBe(400);
      }
    }
  });
});
