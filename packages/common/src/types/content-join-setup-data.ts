import type { ContentJoinSetupNewsletterGroupData } from "./content-join-setup-newsletter-group-data.ts";

export interface ContentJoinSetupData {
  welcome: string;
  newsletterText: string;
  newsletterOptIn: string;
  newsletterTitle: string;
  newsletterGroups: ContentJoinSetupNewsletterGroupData[];
  showNewsletterOptIn: boolean;
  showMailOptIn: boolean;
  mailTitle: string;
  mailText: string;
  mailOptIn: string;
  surveySlug: string;
  surveyRequired: boolean;
  surveyText: string;
}
