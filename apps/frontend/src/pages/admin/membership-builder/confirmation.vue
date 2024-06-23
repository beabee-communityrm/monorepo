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
      <AppForm
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

        <AppCheckbox
          v-model="setupContent.showMailOptIn"
          :label="stepT('showMailOptIn')"
          class="mb-4 font-semibold"
        />

        <template v-if="setupContent.showMailOptIn">
          <div class="mb-4">
            <AppInput
              v-model="setupContent.mailTitle"
              :label="stepT('optInTitle')"
              required
            />
          </div>
          <div class="mb-4">
            <RichTextEditor
              v-model="setupContent.mailText"
              :label="stepT('optInText')"
              required
            />
          </div>
          <div class="mb-4">
            <AppInput
              v-model="setupContent.mailOptIn"
              :label="stepT('optInLabel')"
              required
            />
          </div>
        </template>

        <AppCheckbox
          v-model="setupContent.showNewsletterOptIn"
          :label="stepT('showNewsletterOptIn')"
          class="mb-4 font-semibold"
        />

        <template v-if="setupContent.showNewsletterOptIn">
          <div class="mb-4">
            <AppInput
              v-model="setupContent.newsletterTitle"
              :label="stepT('optInTitle')"
              required
            />
          </div>
          <div class="mb-4">
            <RichTextEditor
              v-model="setupContent.newsletterText"
              :label="stepT('optInText')"
              required
            />
          </div>
          <div class="mb-4">
            <AppInput
              v-model="setupContent.newsletterOptIn"
              :label="stepT('optInLabel')"
              required
            />
          </div>
        </template>

        <AppSubHeading>
          {{ stepT('joinSurvey.title') }}
        </AppSubHeading>
        <p class="mb-4">{{ stepT('joinSurvey.text') }}</p>
        <div class="mb-4">
          <AppSelect
            v-model="setupContent.surveySlug"
            :label="stepT('joinSurvey.slug')"
            :items="[
              { id: '', label: t('common.selectNone') },
              ...openCallouts.map((callout) => ({
                id: callout.id,
                label: callout.title,
              })),
            ]"
          />
          <AppInputHelp :message="stepT('joinSurvey.slugHelp')" />
        </div>
        <template v-if="setupContent.surveySlug">
          <RichTextEditor
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
      </AppForm>
    </template>
    <template #col2>
      <Suspense>
        <SetupForm :setup-content="setupContent" preview />
      </Suspense>
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemStatus } from '@beabee/beabee-common';

import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import SetupForm from '@components/pages/join/SetupForm.vue';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import App2ColGrid from '@components/App2ColGrid.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import AppInputHelp from '@components/forms/AppInputHelp.vue';
import AppSubHeading from '@components/AppSubHeading.vue';

import { fetchCallouts } from '@utils/api/callout';
import { fetchContent, updateContent } from '@utils/api/content';

import type {
  GetCalloutData,
  ContentJoinSetupData,
} from '@beabee/beabee-common';

const setupContent = ref<ContentJoinSetupData>();
const openCallouts = ref<GetCalloutData[]>([]);

const { t } = useI18n();

const stepT = (key: string) =>
  t('membershipBuilder.steps.accountConfirmation.' + key);

async function handleUpdate() {
  if (setupContent.value) {
    await updateContent('join/setup', setupContent.value);
  }
}

onBeforeMount(async () => {
  setupContent.value = await fetchContent('join/setup');

  openCallouts.value = (
    await fetchCallouts({
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
