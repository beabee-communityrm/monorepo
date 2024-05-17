<route lang="yaml">
name: adminSettingsEmail
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <App2ColGrid>
    <template #col1>
      <AppForm
        v-if="emailContent.footer"
        :button-text="t('actions.update')"
        :success-text="t('form.saved')"
        @submit="handleSubmit"
      >
        <AppHeading>{{ t('adminSettings.email.title') }}</AppHeading>
        <p class="mb-4">{{ t('adminSettings.email.text') }}</p>
        <div class="mb-4 max-w-[25rem]">
          <AppInput
            v-model="fromEmailName"
            :label="t('adminSettings.email.fromEmail')"
            required
          >
            <template #after>
              <span class="font-semibold">{{ fromEmailDomain }}</span>
            </template>
          </AppInput>
        </div>
        <div class="mb-4" required>
          <AppInput
            v-model="emailContent.supportEmailName"
            :label="t('adminSettings.email.fromName')"
            required
          />
        </div>
      </AppForm>
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import App2ColGrid from '@components/App2ColGrid.vue';
import AppHeading from '@components/AppHeading.vue';
import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';

import { fetchContent, updateContent } from '@utils/api/content';

import type { ContentEmailData } from '@type';

const { t } = useI18n();

const emailContent = ref<ContentEmailData>({
  footer: '',
  supportEmail: '@',
  supportEmailName: '',
});

const fromEmailName = computed({
  get: () => {
    const i = emailContent.value.supportEmail.lastIndexOf('@');
    return emailContent.value.supportEmail.slice(0, i);
  },
  set: (newName) => {
    emailContent.value.supportEmail = newName + fromEmailDomain.value;
  },
});

const fromEmailDomain = computed(() => {
  const i = emailContent.value.supportEmail.lastIndexOf('@');
  return emailContent.value.supportEmail.slice(i);
});

async function handleSubmit() {
  await updateContent('email', emailContent.value);
}

onBeforeMount(async () => {
  emailContent.value = await fetchContent('email');
});
</script>
