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
    <EmailEditor
      v-if="welcomeEmail"
      v-model:subject="welcomeEmail.subject"
      v-model:content="welcomeEmail.body"
      :heading="stepT('welcomeEmail')"
      :template="{ type: 'contact', id: 'welcome' }"
    />

    <EmailEditor
      v-if="cancellationEmail"
      v-model:subject="cancellationEmail.subject"
      v-model:content="cancellationEmail.body"
      :heading="stepT('cancellationEmail')"
      :template="{ type: 'contact', id: 'cancelled-contribution' }"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { EmailPreviewData } from '@beabee/beabee-common';
import { App2ColGrid, AppForm } from '@beabee/vue';

import EmailEditor from '@components/EmailEditor.vue';
import { client, isApiError } from '@utils/api';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const stepT = (key: string) => t('membershipBuilder.steps.emails.' + key);

const welcomeEmail = ref<EmailPreviewData | false>();
const cancellationEmail = ref<EmailPreviewData | false>();

async function loadEmail(
  templateId: string
): Promise<EmailPreviewData | false> {
  try {
    const email = await client.email.template.get(templateId);
    return { subject: email.subject, body: email.body };
  } catch (err) {
    if (isApiError(err, ['external-email-template'])) {
      return false;
    }
    return { body: '', subject: '' };
  }
}

async function handleUpdate() {
  if (welcomeEmail.value) {
    await client.email.template.update('welcome', welcomeEmail.value);
  }
  if (cancellationEmail.value) {
    await client.email.template.update(
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
