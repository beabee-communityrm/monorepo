<route lang="yaml">
name: adminMembershipBuilderIntroMessages
meta:
  pageTitle: membershipBuilder.title
  role: admin
</route>

<template>
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
  <App2ColGrid v-if="showIntroMessage" extended>
    <template #col1>
      <AppForm
        :button-text="t('form.saveChanges')"
        :success-text="t('form.saved')"
        @submit="handleUpdate"
      >
        <AppRichTextEditor
          v-model="introMessage"
          :label="stepT('message')"
          class="mb-4"
          required
        />
      </AppForm>
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
</template>
<script lang="ts" setup>
import {
  App2ColGrid,
  AppCheckbox,
  AppForm,
  AppRichTextEditor,
  WelcomeMessage,
} from '@beabee/vue';

import { client } from '@utils/api';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

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
