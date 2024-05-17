<route lang="yaml">
name: adminSettingsGeneral
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <AppForm
        :button-text="t('actions.update')"
        :success-text="t('form.saved')"
        @submit="handleSaveGeneral"
      >
        <div class="mb-4">
          <AppInput
            v-model="generalData.organisationName"
            :label="t('adminSettings.general.organisationName')"
            required
          />
        </div>
        <div class="mb-4">
          <AppImageUpload
            v-model="generalData.logoUrl"
            :label="t('adminSettings.general.logo')"
            :width="400"
            :height="400"
            required
          />
        </div>
        <div class="mb-4">
          <AppSelect
            v-model="generalData.locale"
            :label="t('adminSettings.general.language')"
            :items="localeItems"
            class="w-60"
            required
          />
        </div>
      </AppForm>

      <div class="my-8 border-b border-b-primary-40" />

      <AppForm
        v-if="shareContent"
        :button-text="t('actions.update')"
        :success-text="t('form.saved')"
        @submit="handleSaveShare"
      >
        <AppHeading>
          {{ t('adminSettings.general.socialSharing.title') }}
        </AppHeading>
        <p class="mb-4 text-sm text-body-80">
          {{ t('adminSettings.general.socialSharing.text') }}
        </p>
        <div class="mb-4">
          <AppInput
            v-model="shareContent.title"
            :label="t('adminSettings.general.socialSharing.shareTitle')"
            required
          />
        </div>
        <div class="mb-4">
          <AppTextArea
            v-model="shareContent.description"
            :label="t('adminSettings.general.socialSharing.description')"
            required
          />
        </div>
        <div class="mb-4">
          <AppImageUpload
            v-model="shareContent.image"
            :label="t('adminSettings.general.socialSharing.image')"
            :width="1200"
            :height="627"
            required
          />
        </div>
        <div class="mb-4">
          <AppInput
            v-model="shareContent.twitterHandle"
            :label="t('adminSettings.general.socialSharing.twitterHandle')"
          />
        </div>
      </AppForm>
    </template>
    <template #col2>
      <div class="my-8 border-b border-b-primary-40 md:hidden" />

      <!-- Remove this hidden div to make the payment tax form visible -->
      <div class="hidden">
        <AppForm
          :button-text="t('actions.update')"
          :success-text="t('form.saved')"
          @submit="handleSavePayment"
        >
          <AppSubHeading>
            {{ t('adminSettings.payment.paymentTitle') }}</AppSubHeading
          >
          <div class="mb-4">
            <AppCheckbox
              v-model="paymentData.taxRateEnabled"
              :label="t('adminSettings.payment.taxRateEnabled')"
              class="font-bold"
            />
          </div>
          <div
            v-if="paymentData.taxRateEnabled"
            class="mb-4 max-w-[8rem] whitespace-nowrap"
          >
            <AppInput
              v-model="paymentData.taxRate"
              type="number"
              :label="t('adminSettings.payment.taxRate')"
              :min="0"
              :max="100"
              suffix="%"
              required
            />
          </div>
        </AppForm>
        <div class="my-8 border-b border-b-primary-40" />
      </div>

      <AppForm
        :button-text="t('actions.update')"
        :success-text="t('form.saved')"
        @submit="handleSaveFooter"
      >
        <AppHeading>
          {{ t('adminSettings.general.footer.title') }}
        </AppHeading>
        <p class="mb-4 text-sm text-body-80">
          {{ t('adminSettings.general.footer.text') }}
        </p>
        <div class="mb-4">
          <AppInput
            v-model="footerData.siteUrl"
            :label="t('adminSettings.general.footer.siteUrl')"
            type="url"
            required
          />
        </div>
        <AppSubHeading>
          {{ t('adminSettings.general.footer.dataPrivacy.title') }}
        </AppSubHeading>
        <div class="mb-4">
          <AppInput
            v-model="footerData.privacyLink"
            :label="t('adminSettings.general.footer.dataPrivacy.privacyUrl')"
            type="url"
            required
          />
        </div>
        <div class="mb-4">
          <AppInput
            v-model="footerData.termsLink"
            :label="t('adminSettings.general.footer.dataPrivacy.termsUrl')"
            type="url"
          />
        </div>
        <div class="mb-4">
          <AppInput
            v-model="footerData.impressumLink"
            :label="t('adminSettings.general.footer.dataPrivacy.impressumUrl')"
            type="url"
          />
        </div>
        <AppSubHeading>
          {{ t('adminSettings.general.footer.otherLinks.title') }}
        </AppSubHeading>
        <AppLinkList v-model="footerData.footerLinks" class="mb-4" />
      </AppForm>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppImageUpload from '@components/forms/AppImageUpload.vue';
import AppInput from '@components/forms/AppInput.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import AppHeading from '@components/AppHeading.vue';
import AppForm from '@components/forms/AppForm.vue';
import App2ColGrid from '@components/App2ColGrid.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import AppLinkList from '@components/forms/AppLinkList.vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';

import { fetchContent, updateContent } from '@utils/api/content';

import { generalContent as storeGeneralContent } from '@store';

import type { ContentShareData, ContentPaymentData } from '@type';
import { localeItems } from '@lib/i18n';

const { t } = useI18n();

const generalData = reactive({
  organisationName: '',
  logoUrl: '',
  locale: '',
});
const footerData = reactive({
  siteUrl: '',
  privacyLink: '',
  termsLink: '',
  impressumLink: '',
  footerLinks: [] as { text: string; url: string }[],
});

const paymentData = ref<Pick<ContentPaymentData, 'taxRateEnabled' | 'taxRate'>>(
  {
    taxRateEnabled: false,
    taxRate: 7,
  }
);

const shareContent = ref<ContentShareData>();

async function handleSaveGeneral() {
  storeGeneralContent.value = await updateContent('general', generalData);

  // Refresh the favicon
  await axios.get('/favicon.png');
  const faviconEl = document.getElementById('favicon') as HTMLLinkElement;
  // This just forces the browser to reload the image
  // eslint-disable-next-line no-self-assign
  faviconEl.href = faviconEl.href;
}

async function handleSaveShare() {
  if (!shareContent.value) return; // Can't submit without shareContent being loaded
  await updateContent('share', shareContent.value);
}

async function handleSaveFooter() {
  storeGeneralContent.value = await updateContent('general', footerData);
}
async function handleSavePayment() {
  await updateContent('payment', paymentData.value);
}

onBeforeMount(async () => {
  generalData.organisationName = storeGeneralContent.value.organisationName;
  generalData.logoUrl = storeGeneralContent.value.logoUrl;
  generalData.locale = storeGeneralContent.value.locale;

  footerData.siteUrl = storeGeneralContent.value.siteUrl;
  footerData.privacyLink = storeGeneralContent.value.privacyLink;
  footerData.termsLink = storeGeneralContent.value.termsLink || '';
  footerData.impressumLink = storeGeneralContent.value.impressumLink || '';
  footerData.footerLinks =
    storeGeneralContent.value.footerLinks?.map((l) => ({ ...l })) || [];

  shareContent.value = await fetchContent('share');

  const paymentContent = await fetchContent('payment');
  paymentData.value = {
    taxRateEnabled: paymentContent.taxRateEnabled,
    taxRate: paymentContent.taxRate,
  };
});
</script>
