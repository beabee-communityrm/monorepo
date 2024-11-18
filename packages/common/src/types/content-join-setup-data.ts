export interface ContentJoinSetupData {
  welcome: string;
  newsletterText: string;
  newsletterOptIn: string;
  newsletterTitle: string;
  newsletterGroups: { id: string; label: string; checked: boolean }[];
  showNewsletterOptIn: boolean;
  showMailOptIn: boolean;
  mailTitle: string;
  mailText: string;
  mailOptIn: string;
  surveySlug: string;
  surveyRequired: boolean;
  surveyText: string;
}
