import type { ContactData, UpdateContactProfileData } from "./index.ts";

export interface UpdateContactData extends Partial<ContactData> {
  password?: string;
  profile?: UpdateContactProfileData;
  // TODO: Implement
  tags?: string[];
}
