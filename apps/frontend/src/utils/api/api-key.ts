import type {
  CreateApiKeyData,
  GetApiKeyData,
  GetApiKeysQuery,
  Paginated,
  Serial,
} from '@beabee/beabee-common';
import { deserializeDate, instance } from '.';

/** @deprecated Use the ApiKeyClient from the @beabee/client package instead */
function deserializeApiKey(apiKey: Serial<GetApiKeyData>): GetApiKeyData {
  return {
    ...apiKey,
    createdAt: deserializeDate(apiKey.createdAt),
    expires: deserializeDate(apiKey.expires),
  };
}

/** @deprecated Use the ApiKeyClient from the @beabee/client package instead */
export async function createApiKey(
  dataIn: CreateApiKeyData
): Promise<{ token: string }> {
  const { data } = await instance.post<Serial<{ token: string }>>(
    '/api-key',
    dataIn
  );
  return data;
}

/** @deprecated Use the ApiKeyClient from the @beabee/client package instead */
export async function fetchApiKeys(
  query?: GetApiKeysQuery
): Promise<Paginated<GetApiKeyData>> {
  const { data } = await instance.get<Paginated<Serial<GetApiKeyData>>>(
    '/api-key',
    { params: query }
  );

  return { ...data, items: data.items.map(deserializeApiKey) };
}

/** @deprecated Use the ApiKeyClient from the @beabee/client package instead */
export async function deleteApiKey(id: string) {
  await instance.delete('/api-key/' + id);
}
