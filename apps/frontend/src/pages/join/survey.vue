<route lang="yaml">
name: joinSurvey
meta:
  layout: Auth
  pageTitle: pageTitle.setup
</route>

<template>
  <AuthBox
    :title="
      t('joinSetup.welcome', {
        firstName: currentUser?.firstname,
        lastName: currentUser?.lastname,
      })
    "
  >
    <template #header>
      <p class="content-message" v-html="setupContent.surveyText" />
    </template>
    <CalloutForm
      v-if="joinSurvey"
      :callout="joinSurvey"
      :style="'small'"
      no-bg
      @submitted="goToProfile"
    />
    <div v-if="!setupContent.surveyRequired" class="text-center">
      <AppButton variant="text" @click="goToProfile">
        {{ t('actions.skip') }}
      </AppButton>
    </div>
  </AuthBox>
</template>
<script lang="ts" setup>
import type {
  ContentJoinSetupData,
  GetCalloutDataWith,
} from '@beabee/beabee-common';
import { AppButton } from '@beabee/vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AuthBox from '#components/AuthBox.vue';
import CalloutForm from '#components/pages/callouts/CalloutForm.vue';
import { currentUser } from '#store';
import { client } from '#utils/api';

const { t } = useI18n();
const router = useRouter();

const joinSurvey = ref<GetCalloutDataWith<'form'>>();

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

function goToProfile() {
  router.push({ path: '/profile', query: { welcomeMessage: 'true' } });
}

onBeforeMount(async () => {
  try {
    setupContent.value = await client.content.get('join/setup');
    joinSurvey.value = await client.callout.get(setupContent.value.surveySlug, [
      'form',
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    // Fail silently as a failing join survey shouldn't stop the user completing the join flow
    goToProfile();
  }
});
</script>
