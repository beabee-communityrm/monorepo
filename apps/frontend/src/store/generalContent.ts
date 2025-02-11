import { computed, ref } from 'vue';
import { client } from '@utils/api';
import defaultBgUrl from '@assets/images/auth-bg.jpg';
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

export const initGeneralContent = client.content
  .get('general')
  .then((content) => {
    generalContent.value = content;
    return content;
  });

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${generalContent.value.backgroundUrl || defaultBgUrl})`,
}));
