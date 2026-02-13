import type { ContentGeneralData } from '@beabee/beabee-common';

import { client } from '@utils/api';
import { resolveImageUrl } from '@utils/url';
import { computed, ref } from 'vue';

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
  enableOneTimeDonations: false,
});

export const initGeneralContent = () =>
  client.content.get('general').then((content) => {
    generalContent.value = content;
    return content;
  });

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${resolveImageUrl(generalContent.value.backgroundUrl)})`,
}));
