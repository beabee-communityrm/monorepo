import type {
  GetEmailData,
  Serial,
  UpdateEmailData,
} from '@beabee/beabee-common';
import { instance } from '.';

/** @deprecated Use the client instead */
export async function fetchEmail(id: string): Promise<GetEmailData | false> {
  return (await instance.get<Serial<GetEmailData>>('/email/' + id)).data;
}

/** @deprecated Use the client instead */
export async function updateEmail(
  id: string,
  data: UpdateEmailData
): Promise<GetEmailData> {
  return (await instance.put<Serial<GetEmailData>>('/email/' + id, data)).data;
}
