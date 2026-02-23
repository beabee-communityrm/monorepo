import type { FooterLink } from './index.js';

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
  theme: {
    colors?: {
      _name?: string;
      primary?: string;
      link?: string;
      body?: string;
      success?: string;
      warning?: string;
      danger?: string;
      white?: string;
      black?: string;
    };
    fonts?: {
      body?: string;
      title?: string;
    };
  };
  currencyCode: string;
  currencySymbol: string;
  backgroundUrl: string;
  hideContribution: boolean;
  footerLinks: FooterLink[];
  enableOneTimeDonations: boolean;
}
