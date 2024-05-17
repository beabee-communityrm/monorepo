export interface ContentGeneralData {
  organisationName: string;
  logoUrl: string;
  siteUrl: string;
  supportEmail: string;
  privacyLink: string;
  termsLink?: string;
  impressumLink?: string;
  locale: string;
  currencyCode: string;
  currencySymbol: string;
  hideContribution?: boolean;
  footerLinks?: { text: string; url: string }[];
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
  backgroundUrl?: string;
}
