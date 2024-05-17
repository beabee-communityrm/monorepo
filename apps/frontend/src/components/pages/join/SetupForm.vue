<template>
  <AuthBox
    :title="
      t('joinSetup.welcome', {
        firstName: data.firstName,
        lastName: data.lastName,
      })
    "
    :preview="preview"
  >
    <template #header>
      <p class="mb-4">{{ setupContent.welcome }}</p>
      <p>{{ t('joinSetup.confirmDetails') }}</p>
    </template>

    <AppForm
      :button-text="t('joinSetup.continue')"
      full-button
      @submit.prevent="onSubmit?.(data)"
    >
      <ContactBasicFields
        v-model:email="data.email"
        v-model:firstName="data.firstName"
        v-model:lastName="data.lastName"
      />

      <template v-if="setupContent.showMailOptIn">
        <ContactMailOptIn
          v-model="data.profile.deliveryOptIn"
          :content="setupContent"
        />

        <AppAddress
          v-model:line1="data.addressLine1"
          v-model:line2="data.addressLine2"
          v-model:postCode="data.postCode"
          v-model:cityOrTown="data.cityOrTown"
          :required="data.profile.deliveryOptIn"
        />
      </template>

      <AppOptIn
        v-if="showNewsletterOptIn"
        v-model="data.profile.newsletterOptIn"
        :title="setupContent.newsletterTitle"
        :text="setupContent.newsletterText"
        :label="setupContent.newsletterOptIn"
        class="mb-6"
      />
    </AppForm>
  </AuthBox>
</template>
<script lang="ts" setup>
import { NewsletterStatus } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import AppAddress from '@components/AppAddress.vue';
import ContactBasicFields from '@components/contact/ContactBasicFields.vue';
import ContactMailOptIn from '@components/contact/ContactMailOptIn.vue';
import AppOptIn from '@components/AppOptIn.vue';
import AppForm from '@components/forms/AppForm.vue';
import AuthBox from '@components/AuthBox.vue';

import { type SetupContactData } from './join.interface';

import { fetchContact } from '@utils/api/contact';

import type { ContentJoinSetupData } from '@type';

const props = defineProps<{
  setupContent: ContentJoinSetupData;
  onSubmit?: (data: SetupContactData) => Promise<unknown> | unknown;
  preview?: boolean;
}>();

const { t } = useI18n();

useVuelidate({ $stopPropagation: true });

const contact = await fetchContact('me', ['profile']);

const data = reactive<SetupContactData>({
  email: contact.email,
  firstName: contact.firstname,
  lastName: contact.lastname,
  profile: {
    newsletterOptIn: false,
    deliveryOptIn: contact.profile.deliveryOptIn,
  },
  addressLine1: contact.profile.deliveryAddress?.line1 || '',
  addressLine2: contact.profile.deliveryAddress?.line2 || '',
  cityOrTown: contact.profile.deliveryAddress?.city || '',
  postCode: contact.profile.deliveryAddress?.postcode || '',
});

const showNewsletterOptIn = computed(
  () =>
    props.setupContent.showNewsletterOptIn &&
    contact.profile.newsletterStatus !== NewsletterStatus.Subscribed
);
</script>
