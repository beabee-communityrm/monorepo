import { ref } from 'vue';
import type { ContentGeneralData } from '@beabee/beabee-common';

export const generalContent = ref<ContentGeneralData>({
  organisationName: '',
  logoUrl: '',
  siteUrl: '',
  supportEmail: '',
  impressumLink: '',
  privacyLink: '',
  termsLink: '',
  locale: '',
  currencyCode: '',
  currencySymbol: '',
  footerLinks: [],
  theme: {},
  backgroundUrl: '',
  hideContribution: false,
});
