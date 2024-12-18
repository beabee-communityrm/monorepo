import { instance } from '.';

import type {
  GetContactMfaData,
  CreateContactMfaData,
  DeleteContactMfaData,
  Serial,
} from '@beabee/beabee-common';

/**
 * Deserialize a contact MFA
 * @deprecated Use the '@beabee/client' package instead
 * @param data The data to deserialize
 * @returns The deserialized data
 */
export function deserializeContactMfa(
  data: Serial<GetContactMfaData>
): GetContactMfaData {
  // Nothing to do for now
  return data;
}

/**
 * Create a new contact MFA
 * @deprecated Use the '@beabee/client' package instead
 * @param contactId The contact id
 * @param dataIn The data to create the contact MFA
 * @returns
 */
export async function createContactMfa(
  contactId: string,
  dataIn: CreateContactMfaData
): Promise<void> {
  await instance.post<undefined>(`/contact/${contactId}/mfa`, dataIn);
}

/**
 * Fetch a contact MFA
 * @deprecated Use the '@beabee/client' package instead
 * @param contactId The contact id
 * @returns
 */
export async function fetchContactMfa(
  contactId: string
): Promise<GetContactMfaData> {
  const { data } = await instance.get<Serial<GetContactMfaData>>(
    `/contact/${contactId}/mfa`
  );
  return deserializeContactMfa(data);
}

/**
 * Delete a contact MFA
 * @deprecated Use the '@beabee/client' package instead
 * @param id The contact id
 */
export async function deleteContactMfa(
  id: string,
  dataIn: DeleteContactMfaData
): Promise<void> {
  await instance.delete(`/contact/${id}/mfa`, { data: dataIn });
}
