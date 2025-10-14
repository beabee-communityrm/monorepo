import type { CalloutVariantNavigationData } from './index.js';

export interface CalloutVariantData {
  title: string;
  excerpt: string;
  intro: string;
  thanksTitle: string;
  thanksText: string;
  thanksRedirect: string | null;
  shareTitle: string | null;
  shareDescription: string | null;
  slideNavigation: Record<string, CalloutVariantNavigationData>;
  componentText: Record<string, string>;
  /**
   * Map of response footer link label references to their translated value for this variant.
   */
  responseLinkText: Record<string, string>;
  responseEmailSubject: string | null;
  responseEmailBody: string | null;
}
