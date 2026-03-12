<route lang="yaml">
name: adminContactsEmailTemplatesNew
meta:
  pageTitle: contacts.emailTemplates.newTitle
  role: admin
</route>

<template>
  <PageTitle :title="t('contacts.emailTemplates.titleNew')" border />

  <EmailTemplateEditor
    v-model:email="form"
    :submit-button-text="t('actions.save')"
    :reset-button-text="t('actions.back')"
    @submit="handleSubmit"
    @reset="handleBack"
  />
</template>

<script lang="ts" setup>
import type { UpdateEmailData } from '@beabee/beabee-common';
import { PageTitle, addNotification } from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

const LIST_ROUTE = { name: 'adminContactsEmailTemplates' as const };

const { t } = useI18n();
const router = useRouter();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    {
      title: t('contacts.emailTemplates.title'),
      to: router.resolve(LIST_ROUTE).href,
    },
    {
      title: t('contacts.emailTemplates.titleNew'),
    },
  ])
);

const form = ref<UpdateEmailData>({ name: '', subject: '', body: '' });

async function handleBack() {
  return await router.push(LIST_ROUTE);
}

async function handleSubmit() {
  if (!form.value) return;
  try {
    await client.email.create({
      name: form.value.name || '',
      subject: form.value.subject,
      body: form.value.body,
    });
    addNotification({
      variant: 'success',
      title: t('emails.notifications.created'),
    });
    await router.push(LIST_ROUTE);
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  }
}
</script>
