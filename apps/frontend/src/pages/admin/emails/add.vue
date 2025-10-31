<route lang="yaml">
name: adminEmailsAdd
meta:
  role: admin
  pageTitle: menu.emails
</route>

<template>
  <PageTitle :title="t('addEmail.title')" border />
  <AppForm
    :button-text="t('actions.create')"
    :success-text="t('emails.created')"
    @submit="handleSubmit"
  >
    <div class="mb-6">
      <AppInput
        v-model="emailData.name"
        :label="t('emails.form.name')"
        :info-message="t('emails.form.nameHelp')"
        required
      />
    </div>

    <EmailEditor v-model:template="emailTemplate" :always-stacked="false" />
  </AppForm>
</template>

<script lang="ts" setup>
import { AppForm, AppInput, PageTitle, addNotification } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import type { EditableEmailTemplate } from '@type/email-editor';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

interface EmailFormData {
  name: string;
}

const emailData = reactive<EmailFormData>({
  name: '',
});

const emailTemplate = ref<EditableEmailTemplate>({
  subject: '',
  content: '',
});

addBreadcrumb(
  computed(() => [
    { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
    { title: t('addEmail.title') },
  ])
);

async function handleSubmit() {
  // For now, we create a basic email template
  // In the future, this should use a proper create endpoint
  addNotification({
    variant: 'info',
    title: t('emails.createNotImplemented'),
  });
  router.push({ path: '/admin/emails' });
}
</script>
