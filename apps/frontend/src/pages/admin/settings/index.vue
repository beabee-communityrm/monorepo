<route lang="yaml">
name: adminSettingsGeneral
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <AppApiForm
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
            required
          />
        </div>
      </AppApiForm>

      <div class="my-8 border-b border-b-primary-40" />

      <AppApiForm
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
            name="description"
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
      </AppApiForm>
    </template>
    <template #col2>
      <div class="my-8 border-b border-b-primary-40 md:hidden" />

      <AppApiForm
        :button-text="t('actions.update')"
        :success-text="t('form.saved')"
        @submit="handleSavePayment"
      >
        <AppHeading>
          {{ t('adminSettings.payment.paymentTitle') }}
        </AppHeading>
        <TaxRateInput
          v-model="paymentData.taxRateRecurring"
          :label="t('adminSettings.payment.taxRateLabelRecurring')"
        />

        <AppSubHeading>
          {{ t('adminSettings.payment.oneTimeDonationsTitle') }}
        </AppSubHeading>
        <div class="mb-4">
          <AppCheckbox
            v-model="paymentData.enableOneTimeDonation"
            :label="t('adminSettings.payment.enableOneTimeDonation')"
          />
        </div>
        <template v-if="paymentData.enableOneTimeDonation">
          <TaxRateInput
            v-model="paymentData.taxRateOneTime"
            :label="t('adminSettings.payment.taxRateLabelOneTime')"
          />
          <div class="mb-4">
            <AppCheckbox
              v-model="paymentData.showOneTimeDonation"
              :label="t('adminSettings.payment.showOneTimeDonation')"
              class="font-bold"
            />
          </div>
        </template>
      </AppApiForm>

      <div class="my-8 border-b border-b-primary-40" />

      <AppApiForm
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
        <AppLinkList
          v-model="footerData.footerLinks"
          class="mb-4"
          :text-label="t('adminSettings.general.footer.otherLinks.linkText')"
          :url-label="t('adminSettings.general.footer.otherLinks.url')"
          :add-label="t('adminSettings.general.footer.otherLinks.add')"
        />
      </AppApiForm>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import type { ContentShareData } from '@beabee/beabee-common';
import {
  App2ColGrid,
  AppCheckbox,
  AppHeading,
  AppInput,
  AppLinkList,
  AppSelect,
  AppSubHeading,
  AppTextArea,
} from '@beabee/vue';

import { onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppApiForm from '#components/forms/AppApiForm.vue';
import AppImageUpload from '#components/forms/AppImageUpload.vue';
import TaxRateInput from '#components/pages/admin/settings/TaxRateInput.vue';
import { localeItems } from '#lib/i18n';
import { generalContent as storeGeneralContent } from '#store';
import { client } from '#utils/api';

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
const paymentData = reactive({
  taxRateRecurring: null as number | null,
  taxRateOneTime: null as number | null,
  enableOneTimeDonation: false,
  showOneTimeDonation: false,
});

const shareContent = ref<ContentShareData>();

async function handleSaveGeneral() {
  storeGeneralContent.value = await client.content.update(
    'general',
    generalData
  );

  // Refresh the favicon
  await fetch('/favicon.png', {
    method: 'GET',
    credentials: 'include',
  });
  const faviconEl = document.getElementById('favicon') as HTMLLinkElement;
  // This just forces the browser to reload the image
  // eslint-disable-next-line no-self-assign
  faviconEl.href = faviconEl.href;
}

async function handleSaveShare() {
  if (!shareContent.value) return; // Can't submit without shareContent being loaded
  await client.content.update('share', shareContent.value);
}

async function handleSaveFooter() {
  storeGeneralContent.value = await client.content.update(
    'general',
    footerData
  );
}

async function handleSavePayment() {
  storeGeneralContent.value = await client.content.update('general', {
    enableOneTimeDonations: paymentData.enableOneTimeDonation,
  });
  await client.content.update('payment', {
    taxRateRecurring: paymentData.taxRateRecurring,
    taxRateOneTime: paymentData.taxRateOneTime,
    showOneTimeDonation: paymentData.showOneTimeDonation,
  });
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

  shareContent.value = await client.content.get('share');

  const paymentContent = await client.content.get('payment');

  paymentData.taxRateRecurring = paymentContent.taxRateRecurring;
  paymentData.taxRateOneTime = paymentContent.taxRateOneTime;
  paymentData.showOneTimeDonation = paymentContent.showOneTimeDonation;
  paymentData.enableOneTimeDonation =
    storeGeneralContent.value.enableOneTimeDonations;
});
</script>
