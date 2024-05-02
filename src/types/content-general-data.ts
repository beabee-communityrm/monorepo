import type { FooterLink } from "./index.ts";

export interface ContentGeneralData<L = string> {
  organisationName: string;
  logoUrl: string;
  siteUrl: string;
  supportEmail: string;
  privacyLink: string;
  termsLink: string;
  impressumLink: string;
  /** Current locale, e.g. en, de@informal, ... */
  locale: L;
  theme: object;
  currencyCode: string;
  currencySymbol: string;
  backgroundUrl: string;
  hideContribution: boolean;
  footerLinks: FooterLink[];
}
