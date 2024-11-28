import type { GetUploadFlowData, Serial } from '@beabee/beabee-common';
import { instance } from '.';

/** @deprecated Use the '@beabee/client' package instead */
export async function createUploadFlow(): Promise<GetUploadFlowData> {
  const { data } = await instance.post<Serial<GetUploadFlowData>>('/upload');
  return data;
}
