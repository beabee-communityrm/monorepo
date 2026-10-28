import { BeabeeClient } from '@beabee/client';

import testData from '../fixtures/test-data.json' with { type: 'json' };

const { api, testUser } = testData;

/** A client acting as the test admin through their API key */
export const createAdminClient = () =>
  new BeabeeClient({ host: api.host, path: api.path, token: testUser.apiKey });
