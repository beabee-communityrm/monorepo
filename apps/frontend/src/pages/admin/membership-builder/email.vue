<route lang="yaml">
name: adminMembershipBuilderEmail
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

  <AppForm
    class="max-w-[1400px]"
    :button-text="t('form.saveChanges')"
    :success-text="t('form.saved')"
    @submit="handleUpdate"
  >
    <!-- Email editors with server-side preview -->
    <EmailEditor
      v-if="welcomeEmail"
      v-model:subject="welcomeEmail.subject"
      v-model:content="welcomeEmail.body"
      :heading="stepT('welcomeEmail')"
      :server-render="{ type: 'contact', templateId: 'welcome' }"
      :subject-label="t('emailEditor.subject.label')"
      :content-label="t('emailEditor.body.label')"
    />

    <EmailEditor
      v-if="cancellationEmail"
      v-model:subject="cancellationEmail.subject"
      v-model:content="cancellationEmail.body"
      :heading="stepT('cancellationEmail')"
      :server-render="{ type: 'contact', templateId: 'cancelled-contribution' }"
      :subject-label="t('emailEditor.subject.label')"
      :content-label="t('emailEditor.body.label')"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { client, isApiError } from '@utils/api';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<GetEmailData | false>();
const cancellationEmail = ref<GetEmailData | false>();

async function loadEmail(id: string): Promise<GetEmailData | false> {
  try {
    return await client.email.get(id);
  } catch (err) {
    if (isApiError(err, ['external-email-template'])) {
      return false;
    }
    return { body: '', subject: '' };
  }
}

async function handleUpdate() {
  if (welcomeEmail.value) {
    await client.email.update('welcome', welcomeEmail.value);
  }
  if (cancellationEmail.value) {
    await client.email.update(
      'cancelled-contribution',
      cancellationEmail.value
    );
  }
}

onBeforeMount(async () => {
  welcomeEmail.value = await loadEmail('welcome');
  cancellationEmail.value = await loadEmail('cancelled-contribution');
});
</script>
