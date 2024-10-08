import type { GetUploadFlowData, Serial } from '@beabee/beabee-common';
import { instance } from '.';

export async function createUploadFlow(): Promise<GetUploadFlowData> {
  const { data } = await instance.post<Serial<GetUploadFlowData>>('/upload');
  return data;
}
