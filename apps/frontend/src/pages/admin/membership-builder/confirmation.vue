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

        <AppSubHeading class="mt-6">
          {{ stepT('newsletter.title') }}
        </AppSubHeading>
        <AppCheckbox
          v-model="setupContent.showNewsletterOptIn"
          :label="stepT('newsletter.showOptIn')"
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
              :required="setupContent.newsletterGroups.length === 0"
              :disabled="setupContent.newsletterGroups.length > 0"
            />
            <AppInputHelp
              v-if="setupContent.newsletterGroups.length > 0"
              :message="stepT('newsletter.optInDisabled')"
            />
          </div>
          <AppSectionHeading>{{
            stepT('newsletter.groups.title')
          }}</AppSectionHeading>
          <div
            class="content-i18n mb-4"
            v-html="stepT('newsletter.groups.help')"
          />
          <AppRepeatable
            v-model="setupContent.newsletterGroups"
            :new-item="() => ({ id: '', label: '' })"
            :add-label="stepT('newsletter.groups.add')"
            class="mb-4"
          >
            <template #default="{ item }">
              <div class="flex-1">
                <AppInput v-model="item.id" :label="t('common.id')" required />
              </div>
              <div class="flex-1">
                <AppInput
                  v-model="item.label"
                  :label="t('common.label')"
                  required
                />
              </div>
            </template>
          </AppRepeatable>
        </template>

        <AppSubHeading class="mt-6">
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
import {
  ItemStatus,
  type ContentJoinSetupData,
  type GetCalloutData,
} from '@beabee/beabee-common';

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

import AppRepeatable from '@components/forms/AppRepeatable.vue';
import AppSectionHeading from '@components/AppSectionHeading.vue';

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
