<route lang="yaml">
name: adminSettingsEmail
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <AppHeading>{{ t('adminSettings.email.templates.title') }}</AppHeading>
  <AppSubHeading>{{
    t('adminSettings.email.templates.subtitle')
  }}</AppSubHeading>
  <p>{{ t('adminSettings.email.templates.description') }}</p>
  <EmailTemplates class="mb-4"></EmailTemplates>
  <section class="mb-6 lg:mr-6">
    <AppSubHeading>{{
      t('adminSettings.email.contactTemplates.title')
    }}</AppSubHeading>
    <p class="mb-4">
      {{ t('adminSettings.email.contactTemplates.description') }}
    </p>
    <AppButton to="/admin/contacts/email-templates" variant="primaryOutlined">
      {{ t('adminSettings.email.contactTemplates.button') }}
    </AppButton>
  </section>
  <App2ColGrid>
    <template #col1>
      <AppApiForm
        class="mb-6"
        :button-text="t('actions.update')"
        :success-text="t('form.saved')"
        @submit="handleSubmit"
      >
        <AppHeading>{{ t('adminSettings.email.title') }}</AppHeading>
        <p class="mb-4">{{ t('adminSettings.email.text') }}</p>
        <FromEmailInput
          v-model:email="supportEmail"
          v-model:name="supportEmailName"
          class="mb-4"
        />
      </AppApiForm>
    </template>
  </App2ColGrid>
</template>
<script lang="ts" setup>
import { App2ColGrid, AppButton, AppHeading, AppSubHeading } from '@beabee/vue';

import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppApiForm from '#components/forms/AppApiForm.vue';
import FromEmailInput from '#components/forms/FromEmailInput.vue';
import EmailTemplates from '#components/pages/admin/settings/EmailTemplates.vue';
import { client } from '#utils/api';

const { t } = useI18n();

const supportEmail = ref<string>('');
const supportEmailName = ref<string>('');

async function handleSubmit() {
  await client.content.update('email', {
    supportEmail: supportEmail.value,
    supportEmailName: supportEmailName.value,
  });
}

onBeforeMount(async () => {
  const content = await client.content.get('email');
  supportEmail.value = content.supportEmail;
  supportEmailName.value = content.supportEmailName;
});
</script>
