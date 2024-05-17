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
        <RichTextEditor
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
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppForm from '../../../components/forms/AppForm.vue';
import AppCheckbox from '../../../components/forms/AppCheckbox.vue';
import RichTextEditor from '../../../components/rte/RichTextEditor.vue';
import { fetchContent } from '../../../utils/api/content';
import WelcomeMessage from '../../../components/welcome-message/WelcomeMessage.vue';
import { currentUser } from '../../../store';
import { updateContent } from '../../../utils/api/content';
import App2ColGrid from '../../../components/App2ColGrid.vue';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.intro.' + key);

const introMessage = ref('');
const showIntroMessage = ref(false);

async function handleUpdate() {
  await updateContent('profile', {
    introMessage: showIntroMessage.value ? introMessage.value : '',
  });
}

onBeforeMount(async () => {
  introMessage.value = (await fetchContent('profile')).introMessage;
  showIntroMessage.value = !!introMessage.value;
});
</script>
