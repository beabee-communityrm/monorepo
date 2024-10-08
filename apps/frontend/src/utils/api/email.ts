import type {
  GetEmailData,
  Serial,
  UpdateEmailData,
} from '@beabee/beabee-common';
import { instance } from '.';

export async function fetchEmail(id: string): Promise<GetEmailData | false> {
  return (await instance.get<Serial<GetEmailData>>('/email/' + id)).data;
}

export async function updateEmail(
  id: string,
  data: UpdateEmailData
): Promise<GetEmailData> {
  return (await instance.put<Serial<GetEmailData>>('/email/' + id, data)).data;
}
