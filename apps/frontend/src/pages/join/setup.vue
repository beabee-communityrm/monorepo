<route lang="yaml">
name: joinSetup
meta:
  layout: Auth
  pageTitle: pageTitle.setup
</route>

<template>
  <Suspense>
    <SetupForm
      :setup-content="setupContent"
      :loading="isSaving"
      @submit="handleSubmitSetup"
    />
  </Suspense>
</template>

<script lang="ts" setup>
import { NewsletterStatus } from '@beabee/beabee-common';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import SetupForm from '@components/pages/join/SetupForm.vue';

import { fetchContent } from '@utils/api/content';
import { updateContact } from '@utils/api/contact';

import { updateCurrentUser } from '@store';

import type { SetupContactData } from '@components/pages/join/join.interface';
import type { ContentJoinSetupData, UpdateContactData } from '@type';

const router = useRouter();

const setupContent = ref<ContentJoinSetupData>({
  welcome: '',
  newsletterText: '',
  newsletterOptIn: '',
  newsletterTitle: '',
  showNewsletterOptIn: false,
  showMailOptIn: false,
  mailTitle: '',
  mailText: '',
  mailOptIn: '',
  surveySlug: '',
  surveyRequired: false,
  surveyText: '',
});

const isSaving = ref(false);

async function handleSubmitSetup(data: SetupContactData) {
  isSaving.value = true;

  const updateContactData: UpdateContactData = {
    email: data.email,
    firstname: data.firstName,
    lastname: data.lastName,
  };

  if (data.profile.newsletterOptIn || setupContent.value.showMailOptIn) {
    updateContactData.profile = {
      ...(data.profile.newsletterOptIn && {
        newsletterStatus: NewsletterStatus.Subscribed,
      }),
      ...(setupContent.value.showMailOptIn && {
        deliveryOptIn: data.profile.deliveryOptIn,
        deliveryAddress: {
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.cityOrTown,
          postcode: data.postCode,
        },
      }),
    };
  }

  const updatedContact = await updateContact('me', updateContactData);
  await updateCurrentUser(updatedContact);

  if (setupContent.value.surveySlug) {
    router.push({ path: '/join/survey' });
  } else {
    router.push({ path: '/profile', query: { welcomeMessage: 'true' } });
  }
}

onBeforeMount(async () => {
  setupContent.value = await fetchContent('join/setup');
});
</script>
