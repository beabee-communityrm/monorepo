import { BeabeeClient, isApiError, ClientApiError } from '@beabee/client';
import env from '@env';

export const client = new BeabeeClient({
  path: env.apiUrl,
  host: env.appUrl,
  headers: {
    'X-Beabee-Version': `${env.version} / ${env.revision}`,
  },
});

export { isApiError, ClientApiError };
