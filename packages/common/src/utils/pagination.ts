import { Paginated } from '../types';

/**
 * Fetches paginated data from an API endpoint.
 * This function handles pagination by making multiple API calls
 * until all pages of data are retrieved.
 *
 * @param apiCall - Function that makes the API call, accepting an optional
 *                  parameters object with `offset` and `limit`.
 * @param pageSize - Number of items to fetch per page (default is 100).
 * @returns A promise that resolves to an array of all items across all pages.
 */
export async function fetchAllPages<T>(
  apiCall: (params?: {
    offset?: number;
    limit?: number;
  }) => Promise<Paginated<T>>,
  pageSize: number = 100
): Promise<T[]> {
  const firstResponse = await apiCall({ offset: 0, limit: pageSize });
  const totalItems = firstResponse.total;
  const promises: Promise<Paginated<T>>[] = [];

  for (let offset = pageSize; offset < totalItems; offset += pageSize) {
    promises.push(apiCall({ offset, limit: pageSize }));
  }

  const responses = await Promise.all(promises);
  return [firstResponse, ...responses].flatMap((response) => response.items);
}
