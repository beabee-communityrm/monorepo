import type { ContentGeneralData } from '@beabee/beabee-common';
import { computed, ref } from 'vue';
import { fetchContent } from '@utils/api/content';
import defaultBgUrl from '@assets/images/auth-bg.jpg';

export const generalContent = ref<ContentGeneralData>({
  organisationName: '',
  logoUrl: '',
  siteUrl: '',
  supportEmail: '',
  privacyLink: '',
  termsLink: '',
  impressumLink: '',
  locale: '',
  currencyCode: '',
  currencySymbol: '',
  footerLinks: [],
  theme: {},
  backgroundUrl: '',
  hideContribution: false,
});

export const initGeneralContent = fetchContent('general').then((content) => {
  generalContent.value = content;
  return content;
});

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${generalContent.value.backgroundUrl || defaultBgUrl})`,
}));
