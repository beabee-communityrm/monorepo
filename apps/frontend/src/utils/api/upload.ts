import { instance } from '.';
import type { GetUploadFlowData, Serial } from '@type';

export async function createUploadFlow(): Promise<GetUploadFlowData> {
  const { data } = await instance.post<Serial<GetUploadFlowData>>('/upload');
  return data;
}
