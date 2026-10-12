<route lang="yaml">
name: adminMembershipBuilderIntroMessages
meta:
  pageTitle: membershipBuilder.title
  role: admin
</route>

<template>
  <AppApiForm
    :button-text="t('form.saveChanges')"
    :success-text="t('form.saved')"
    @submit="handleUpdate"
  >
    <App2ColGrid>
      <template #col1>
        <p class="mb-8">{{ stepT('text') }}</p>
        <AppCheckbox
          v-model="showIntroMessage"
          :label="stepT('showWelcomeMessage')"
          class="mb-4 font-semibold"
        />
      </template>
    </App2ColGrid>
    <App2ColGrid v-if="showIntroMessage" class="mb-6" extended>
      <template #col1>
        <AppRichTextEditor
          v-model="introMessage"
          :label="stepT('message')"
          required
        />
      </template>
      <template #col2>
        <WelcomeMessage
          :first-name="currentUser?.firstname || ''"
          :last-name="currentUser?.lastname || ''"
          :text="introMessage"
          small
        />
      </template>
    </App2ColGrid>
  </AppApiForm>
</template>
<script lang="ts" setup>
import {
  App2ColGrid,
  AppCheckbox,
  AppRichTextEditor,
  WelcomeMessage,
} from '@beabee/vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppApiForm from '#components/forms/AppApiForm.vue';
import { client } from '#utils/api';

import { currentUser } from '../../../store';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.intro.' + key);

const introMessage = ref('');
const showIntroMessage = ref(false);

async function handleUpdate() {
  await client.content.update('profile', {
    introMessage: showIntroMessage.value ? introMessage.value : '',
  });
}

onBeforeMount(async () => {
  introMessage.value = (await client.content.get('profile')).introMessage;
  showIntroMessage.value = !!introMessage.value;
});
</script>
