import type { Paginated } from '@beabee/beabee-common';
import { deserializeDate, instance } from '.';

import type {
  CreateApiKeyData,
  GetApiKeyData,
  GetApiKeysQuery,
  Serial,
} from '@type';

function deserializeApiKey(apiKey: Serial<GetApiKeyData>): GetApiKeyData {
  return {
    ...apiKey,
    createdAt: deserializeDate(apiKey.createdAt),
    expires: deserializeDate(apiKey.expires),
  };
}

export async function createApiKey(
  dataIn: CreateApiKeyData
): Promise<{ token: string }> {
  const { data } = await instance.post<Serial<{ token: string }>>(
    '/api-key',
    dataIn
  );
  return data;
}

export async function fetchApiKeys(
  query?: GetApiKeysQuery
): Promise<Paginated<GetApiKeyData>> {
  const { data } = await instance.get<Paginated<Serial<GetApiKeyData>>>(
    '/api-key',
    { params: query }
  );

  return { ...data, items: data.items.map(deserializeApiKey) };
}

export async function deleteApiKey(id: string) {
  await instance.delete('/api-key/' + id);
}
