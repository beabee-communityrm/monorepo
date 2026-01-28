<route lang="yaml">
name: adminMembershipBuilderAccountConfirmation
meta:
  pageTitle: membershipBuilder.title
  role: admin
</route>

<template>
  <App2ColGrid class="mb-8">
    <template #col1>
      <p>{{ stepT('text') }}</p>
    </template>
  </App2ColGrid>
  <App2ColGrid v-if="setupContent" extended>
    <template #col1>
      <AppApiForm
        :button-text="t('form.saveChanges')"
        :success-text="t('form.saved')"
        @submit="handleUpdate"
      >
        <div class="mb-4">
          <AppInput
            v-model="setupContent.welcome"
            :label="stepT('welcomeMessage')"
          />
        </div>

        <AppSubHeading class="mt-6">
          {{ stepT('deliveryAddress.title') }}
        </AppSubHeading>
        <AppCheckbox
          v-model="setupContent.showMailOptIn"
          :label="stepT('deliveryAddress.showOptIn')"
          class="mb-4 font-semibold"
        />

        <template v-if="setupContent.showMailOptIn">
          <div class="mb-4">
            <AppInput
              v-model="setupContent.mailTitle"
              :label="t('mailOptIn.title')"
              required
            />
          </div>
          <div class="mb-4">
            <AppRichTextEditor
              v-model="setupContent.mailText"
              :label="t('mailOptIn.text')"
              required
            />
          </div>
          <div class="mb-4">
            <AppInput
              v-model="setupContent.mailOptIn"
              :label="t('mailOptIn.optInLabel')"
              required
            />
          </div>
        </template>

        <AppSubHeading class="mt-6">
          {{ stepT('newsletter.title') }}
        </AppSubHeading>
        <AppCheckbox
          v-model="setupContent.showNewsletterOptIn"
          :label="stepT('newsletter.showOptIn')"
          class="mb-4 font-semibold"
        />
        <AppNewsletterOptInSettings
          v-if="setupContent.showNewsletterOptIn"
          v-model:title="setupContent.newsletterTitle"
          v-model:text="setupContent.newsletterText"
          v-model:opt-in="setupContent.newsletterOptIn"
          v-model:groups="setupContent.newsletterGroups"
        />

        <AppSubHeading class="mt-6">
          {{ stepT('joinSurvey.title') }}
        </AppSubHeading>
        <p class="mb-4">{{ stepT('joinSurvey.text') }}</p>
        <div class="mb-4">
          <AppSelect
            v-model="setupContent.surveySlug"
            :label="stepT('joinSurvey.slug')"
            :info-message="stepT('joinSurvey.slugHelp')"
            :items="[
              { id: '', label: t('common.selectNone') },
              ...openCallouts.map((callout) => ({
                id: callout.id,
                label: callout.title,
              })),
            ]"
          />
        </div>
        <template v-if="setupContent.surveySlug">
          <AppRichTextEditor
            v-model="setupContent.surveyText"
            :label="stepT('joinSurvey.textIntro')"
            class="mb-4"
          />

          <AppCheckbox
            v-model="setupContent.surveyRequired"
            :label="stepT('joinSurvey.required')"
            class="mb-4 font-semibold"
          />
        </template>
      </AppApiForm>
    </template>
    <template #col2>
      <Suspense>
        <SetupForm :setup-content="setupContent" preview />
      </Suspense>
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import {
  type ContentJoinSetupData,
  type GetCalloutData,
  ItemStatus,
} from '@beabee/beabee-common';
import {
  App2ColGrid,
  AppCheckbox,
  AppInput,
  AppRichTextEditor,
  AppSelect,
  AppSubHeading,
} from '@beabee/vue';

import AppApiForm from '@components/forms/AppApiForm.vue';
import AppNewsletterOptInSettings from '@components/newsletter/AppNewsletterOptInSettings.vue';
import SetupForm from '@components/pages/join/SetupForm.vue';
import { client } from '@utils/api';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const setupContent = ref<ContentJoinSetupData>();
const openCallouts = ref<GetCalloutData[]>([]);

const { t } = useI18n();

const stepT = (key: string) =>
  t('membershipBuilder.steps.accountConfirmation.' + key);

async function handleUpdate() {
  if (setupContent.value) {
    await client.content.update('join/setup', setupContent.value);
  }
}

onBeforeMount(async () => {
  setupContent.value = await client.content.get('join/setup');

  openCallouts.value = (
    await client.callout.list({
      limit: 100,
      rules: {
        condition: 'AND',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
          { field: 'expires', operator: 'is_empty', value: [] },
        ],
      },
      sort: 'title',
    })
  ).items;
});
</script>
