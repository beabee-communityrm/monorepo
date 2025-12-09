<route lang="yaml">
name: adminEmailsAdd
meta:
  role: admin
  pageTitle: emails.add.title
</route>

<template>
  <PageTitle :title="t('emails.add.title')" back border />
  <AppForm :button-text="t('actions.create')" @submit="handleSubmit">
    <div class="mb-6 max-w-2xl">
      <AppInput
        v-model="emailData.name"
        :label="t('emails.name')"
        required
        class="mb-4"
      />
      <AppInput
        v-model="emailData.fromName"
        :label="t('emails.fromName')"
        class="mb-4"
      />
      <AppInput
        v-model="emailData.fromEmail"
        :label="t('emails.fromEmail')"
        type="email"
        class="mb-4"
      />
    </div>

    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      :heading="t('emailEditor.body.label')"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type { CreateEmailData } from '@beabee/beabee-common';
import { AppForm, AppInput, PageTitle } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import EmailEditor from '@components/EmailEditor.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

addBreadcrumb(
  computed(() => [
    { title: t('emails.tabs.custom'), to: '/admin/emails/custom' },
    { title: t('emails.add.title') },
  ])
);

const emailData = reactive<CreateEmailData>({
  name: '',
  fromName: '',
  fromEmail: '',
  subject: '',
  body: '',
});

async function handleSubmit() {
  try {
    const created = await client.email.create(emailData);

    addNotification({
      variant: 'success',
      title: t('emails.notifications.created'),
    });

    // Redirect to edit page
    router.push(`/admin/emails/edit/${created.id}`);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}
</script>
