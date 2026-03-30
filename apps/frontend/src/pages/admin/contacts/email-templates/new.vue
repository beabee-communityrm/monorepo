<route lang="yaml">
name: adminContactsEmailTemplatesNew
meta:
  pageTitle: contacts.emailTemplates.newTitle
  role: admin
</route>

<template>
  <PageTitle :title="t('contacts.emailTemplates.newTitle')" border />

  <AppApiForm
    :button-text="t('actions.save')"
    :reset-button-text="t('actions.back')"
    :success-message="t('emails.notifications.created')"
    inline-error
    @submit="handleSubmit"
    @reset="handleBack"
  >
    <EmailTemplateEditor v-model:email="form" />
  </AppApiForm>
</template>

<script lang="ts" setup>
import type { CreateEmailData } from '@beabee/beabee-common';
import { PageTitle } from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import AppApiForm from '#components/forms/AppApiForm.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';

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
      title: t('contacts.emailTemplates.newTitle'),
    },
  ])
);

const form = ref<CreateEmailData>({
  name: '',
  fromName: null,
  fromEmail: null,
  subject: '',
  body: '',
});

async function handleBack() {
  return await router.push(LIST_ROUTE);
}

async function handleSubmit() {
  await client.email.create(form.value);
  await router.push(LIST_ROUTE);
}
</script>
