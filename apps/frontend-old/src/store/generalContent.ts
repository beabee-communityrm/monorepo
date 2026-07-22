import type { ContentGeneralData } from '@beabee/beabee-common';

import { computed, ref } from 'vue';

import { client } from '#utils/api';
import { resolveImageUrl } from '#utils/url';

const isInited = ref(false);

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

export const initGeneralContent = async () => {
  if (!isInited.value) {
    generalContent.value = await client.content.get('general');
    isInited.value = true;
  }
};

export const backgroundStyle = computed(() => ({
  backgroundImage: `url(${resolveImageUrl(generalContent.value.backgroundUrl)})`,
}));
