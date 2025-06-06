import type { GetContactData } from './index.js';

export interface GetApiKeyData {
  id: string;
  description: string;
  expires: Date | null;
  creator: GetContactData;
  createdAt: Date;
}
