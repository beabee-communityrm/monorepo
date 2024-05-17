import type { GetContactData } from "./index.ts";

export interface GetApiKeyData {
  id: string;
  description: string;
  expires: Date | null;
  creator: GetContactData;
  createdAt: Date;
}
