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

    <AppApiForm
      :button-text="t('joinSetup.continue')"
      full-button
      @submit.prevent="onSubmit?.(data)"
    >
      <div class="mb-6">
        <ContactBasicFields
          v-model:email="data.email"
          v-model:first-name="data.firstName"
          v-model:last-name="data.lastName"
        />

        <AppInput
          v-model="data.password"
          :label="t('form.password')"
          type="password"
          name="password"
          required
          :info-message="t('form.passwordInfo')"
        />
      </div>

      <section v-if="setupContent.showMailOptIn" class="mb-6">
        <ContactMailOptIn
          v-model="data.profile.deliveryOptIn"
          :content="setupContent"
        />

        <AppAddress
          v-model:line1="data.addressLine1"
          v-model:line2="data.addressLine2"
          v-model:post-code="data.postCode"
          v-model:city-or-town="data.cityOrTown"
          :required="data.profile.deliveryOptIn"
        />
      </section>

      <AppNewsletterOptIn
        v-if="showNewsletterOptIn"
        v-model="data.profile.newsletterOptIn"
        v-model:opt-in-groups="data.profile.newsletterGroups"
        :title="setupContent.newsletterTitle"
        :text="setupContent.newsletterText"
        :opt-in="setupContent.newsletterOptIn"
        :groups="setupContent.newsletterGroups"
        class="mb-6"
      />
    </AppApiForm>
  </AuthBox>
</template>
<script lang="ts" setup>
import {
  type ContentJoinSetupData,
  GetContactWith,
  NewsletterStatus,
} from '@beabee/beabee-common';
import { AppAddress, AppInput } from '@beabee/vue';

import AuthBox from '@components/AuthBox.vue';
import ContactBasicFields from '@components/contact/ContactBasicFields.vue';
import ContactMailOptIn from '@components/contact/ContactMailOptIn.vue';
import AppApiForm from '@components/forms/AppApiForm.vue';
import AppNewsletterOptIn from '@components/newsletter/AppNewsletterOptIn.vue';
import { client } from '@utils/api';
import useVuelidate from '@vuelidate/core';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import { type SetupContactData } from './join.interface';

const props = defineProps<{
  setupContent: ContentJoinSetupData;
  onSubmit?: (data: SetupContactData) => Promise<unknown> | unknown;
  preview?: boolean;
}>();

const { t } = useI18n();

useVuelidate({ $stopPropagation: true });

const contact = await client.contact.get('me', [GetContactWith.Profile]);

const data = reactive<SetupContactData>({
  email: contact.email,
  firstName: contact.firstname,
  lastName: contact.lastname,
  password: '',
  profile: {
    newsletterOptIn:
      contact.profile.newsletterStatus === NewsletterStatus.Subscribed,
    newsletterGroups: [
      ...contact.profile.newsletterGroups,
      ...props.setupContent.newsletterGroups
        .filter((g) => g.checked)
        .map((g) => g.id),
    ].filter((v, i, a) => a.indexOf(v) === i),
    deliveryOptIn: contact.profile.deliveryOptIn,
  },
  addressLine1: contact.profile.deliveryAddress?.line1 || '',
  addressLine2: contact.profile.deliveryAddress?.line2 || '',
  cityOrTown: contact.profile.deliveryAddress?.city || '',
  postCode: contact.profile.deliveryAddress?.postcode || '',
});

const hasNewsletterGroups = computed(
  () => props.setupContent.newsletterGroups.length > 0
);

const showNewsletterOptIn = computed(
  () =>
    props.setupContent.showNewsletterOptIn &&
    (contact.profile.newsletterStatus !== NewsletterStatus.Subscribed ||
      hasNewsletterGroups.value)
);
</script>
