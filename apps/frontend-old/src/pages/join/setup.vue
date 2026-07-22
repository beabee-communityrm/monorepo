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
import {
  type ContentJoinSetupData,
  NewsletterStatus,
  type UpdateContactProfileData,
} from '@beabee/beabee-common';

import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import SetupForm from '#components/pages/join/SetupForm.vue';
import type { SetupContactData } from '#components/pages/join/join.interface';
import { updateCurrentUser } from '#store';
import { client } from '#utils/api';

const router = useRouter();

const setupContent = ref<ContentJoinSetupData>({
  welcome: '',
  newsletterText: '',
  newsletterOptIn: '',
  newsletterTitle: '',
  newsletterGroups: [],
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

  const profile: UpdateContactProfileData = {
    // Subscribe the user if they've opted in or selected groups
    ...(setupContent.value.showNewsletterOptIn &&
      (data.profile.newsletterOptIn ||
        data.profile.newsletterGroups.length > 0) && {
        newsletterStatus: NewsletterStatus.Subscribed,
        newsletterGroups: data.profile.newsletterGroups,
      }),
    // Only set mail opt-in if the opt-in was visible
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

  await client.contact.update('me', {
    email: data.email,
    firstname: data.firstName,
    lastname: data.lastName,
    password: data.password,
    ...(Object.keys(profile).length > 0 && { profile }),
  });

  await updateCurrentUser();

  if (setupContent.value.surveySlug) {
    router.push({ path: '/join/survey' });
  } else {
    router.push({ path: '/profile', query: { welcomeMessage: 'true' } });
  }
}

onBeforeMount(async () => {
  setupContent.value = await client.content.get('join/setup');
});
</script>
