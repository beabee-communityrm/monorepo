import type { GetContactData } from '@type';

export interface GetApiKeyData {
  id: string;
  description: string;
  expires: Date | null;
  creator: GetContactData;
  createdAt: Date;
}
