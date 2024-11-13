import type { ContactData, UpdateContactProfileData } from "./index.ts";

export interface UpdateContactData extends Partial<ContactData> {
  password?: string;
  profile?: UpdateContactProfileData;
  /** List of tags ids to add to the contact */
  tags?: string[];
}
