import type { BaseClient } from '@beabee/client';
import { api } from '@beabee/test-utils/test-data';

/**
 * Log in a user via the dev-only login endpoint, which replaces the removed
 * password login. The session cookie is stored in the shared cookie jar so
 * subsequent requests from any client are authenticated.
 * @param client Any API client, used for its fetch instance
 * @param email The email of the user to log in as
 */
export async function devLogin(
  client: Pick<BaseClient, 'fetch'>,
  email: string
): Promise<void> {
  await client.fetch.get(
    `${api.host}${api.path}/dev/login/as/${encodeURIComponent(email)}`,
    {},
    // The endpoint redirects on success, don't follow it so the session
    // cookie on the redirect response is stored
    { credentials: 'include', redirect: 'manual' }
  );
}
