import { describe, beforeAll } from "@jest/globals";
import { ClientApiError, ContactClient } from '@beabee/client';

import dotenv from 'dotenv';

const HOST = process.env.APP_BASE_URL || 'http://localhost:3002';
const PATH = process.env.API_BASE_URL || '/api/1.0';

dotenv.config({ path: ['.env', '.env.example'] });

describe('Contact API', () => {
  let contactClient: ContactClient;

  beforeAll(() => {
    contactClient = new ContactClient({
      host: HOST,
      path: PATH,
      token: 'test-token',
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
