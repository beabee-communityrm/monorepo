import type {
  ContactOriginData,
  CreatePaymentData,
  NewsletterStatus,
  StartContributionData,
} from '@beabee/beabee-common';

export interface SignupData {
  email: string;
  contribution?: StartContributionData;
  oneTimePayment?: CreatePaymentData;
  origin?: ContactOriginData;
  newsletterStatus?: NewsletterStatus;
  newsletterGroups?: string[];
  /** Where to send the member after confirming their email, defaults to the setup page */
  postConfirmUrl?: string;
}
