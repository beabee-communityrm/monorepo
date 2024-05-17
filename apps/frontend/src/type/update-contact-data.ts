import type { ContactData, UpdateContactProfileData } from '@type';

export interface UpdateContactData extends Partial<ContactData> {
  password?: string;
  profile?: UpdateContactProfileData;
}
