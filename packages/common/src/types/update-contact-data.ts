import type {
  ContactData,
  UpdateContactNewsletterData,
  UpdateContactProfileData,
} from './index.js';

export interface UpdateContactData extends Partial<ContactData> {
  password?: string;
  profile?: UpdateContactProfileData;
  newsletter?: UpdateContactNewsletterData;
  /** List of tags ids to add to the contact */
  tags?: string[];
}
