import { ContributionPeriod, NewsletterStatus } from "@beabee/beabee-common";

export interface ContactNewsletterUpdates {
  email?: string | undefined;
  firstname?: string;
  lastname?: string;
  referralCode?: string | null;
  pollsCode?: string | null;
  contributionPeriod?: ContributionPeriod | null;
  contributionMonthlyAmount?: number | null;
  newsletterStatus?: NewsletterStatus | undefined;
  newsletterGroups?: string[] | undefined;
}
