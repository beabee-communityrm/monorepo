<route lang="yaml">
name: adminEmailsCustomEdit
meta:
  pageTitle: menu.emails
  role: admin
</route>

<template>
  <template v-if="email && emailData">
    <PageTitle
      :title="t('editCustomEmail.title', { title: emailData.name })"
      border
    />

    <AppForm
      :button-text="t('actions.save')"
      :success-text="t('emails.saved')"
      @submit="handleSubmit"
    >
      <div class="mb-6">
        <AppInput
          v-model="emailData.name"
          :label="t('emails.form.name')"
          required
        />
      </div>

      <EmailEditor v-model:template="emailTemplate" :always-stacked="false" />
    </AppForm>
  </template>
</template>

<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import { AppForm, AppInput, PageTitle, addNotification } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import type { EditableEmailTemplate } from '@type/email-editor';
import { client } from '@utils/api';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

/**
 * Safely get the 'id' parameter from the route
 */
function getEmailId(): string {
  const params = route.params as Record<string, string | string[]>;
  const id = params['id'];

  if (typeof id !== 'string') {
    throw new Error('Email ID parameter is missing or invalid');
  }
  return id;
}

interface EmailFormData {
  name: string;
}

const email = ref<GetEmailData | undefined>();
const emailData = reactive<EmailFormData>({
  name: '',
});

const emailTemplate = ref<EditableEmailTemplate>({
  subject: '',
  content: '',
});

addBreadcrumb(
  computed(() => {
    const id = getEmailId();
    return [
      { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
      {
        title: emailData.name || '',
        to: '/admin/emails/custom/' + id,
      },
      { title: t('actions.edit') },
    ];
  })
);

onBeforeMount(async () => {
  const id = getEmailId();
  email.value = await client.email.get(id);
  if (email.value) {
    emailData.name = email.value.name;
    emailTemplate.value = {
      subject: email.value.subject,
      content: email.value.body,
    };
  }
});

async function handleSubmit() {
  const id = getEmailId();

  await client.email.update(id, {
    subject: emailTemplate.value.subject,
    body: emailTemplate.value.content,
  });

  addNotification({
    variant: 'success',
    title: t('emails.updated'),
  });

  router.push({ path: '/admin/emails' });
}
</script>
