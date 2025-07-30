import { Paginated } from '@beabee/beabee-common';

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
  const responses = [firstResponse];

  for (let offset = pageSize; offset < totalItems; offset += pageSize) {
    const response = await apiCall({ offset, limit: pageSize });
    responses.push(response);
  }

  return responses.flatMap((response) => response.items);
}
