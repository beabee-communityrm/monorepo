<route lang="yaml">
name: adminContactsSendEmailSegmentId
meta:
  pageTitle: contacts.sendEmail.title
  role: admin
</route>

<template>
  <PageTitle :title="pageTitle" border />

  <div v-if="loading">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <template v-else-if="segment">
    <OngoingEmailSettings
      v-model:is-ongoing="isOngoing"
      v-model:trigger="ongoingTrigger"
      v-model:direct-send="ongoingDirectSend"
      :segment-id="segmentId"
      show-direct-send
    />

    <EmailTemplateEditor
      v-model:email="emailData"
      :submit-button-text="submitButtonText"
      :reset-button-text="t('actions.goBack')"
      show-select-template
      :contacts="segmentContacts"
      :default-new-template-name="defaultNewTemplateName"
      @submit="handleSubmit"
      @reset="handleBack"
    />
  </template>
</template>

<script lang="ts" setup>
import type { GetContactData, GetSegmentData } from '@beabee/beabee-common';
import { PageTitle, addNotification } from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import OngoingEmailSettings from '#components/emails/OngoingEmailSettings.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

import { useOngoingEmailSettings } from '../../../../composables/useOngoingEmailSettings';

const PREVIEW_CONTACTS_LIMIT = 50;

const { t } = useI18n();
const route = useRoute('adminContactsSendEmailSegmentId');
const router = useRouter();

const segmentId = computed(() => route.params.segmentId);

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    {
      title: segment.value
        ? `${t('contacts.sendEmail.title')}: ${segment.value.name}`
        : t('contacts.sendEmail.title'),
    },
  ])
);

const backUrl = computed(
  () => `/admin/contacts${segmentId.value ? `?segment=${segmentId.value}` : ''}`
);

const pageTitle = computed(() => {
  if (!segment.value) return t('contacts.sendEmail.title');
  return `${t('contacts.sendEmail.title')}: ${segment.value.name}`;
});

// State
const loading = ref(true);
const segment = ref<GetSegmentData | null>(null);
const segmentContacts = ref<GetContactData[]>([]);
const emailData = ref({ name: '', subject: '', body: '' });

const {
  isOngoing,
  trigger: ongoingTrigger,
  directSend: ongoingDirectSend,
  shouldSendImmediately,
  buildCreatePayload,
} = useOngoingEmailSettings();

const submitButtonText = computed(() =>
  shouldSendImmediately.value
    ? t('adminSettings.email.contactTemplates.send')
    : t('adminSettings.email.contactTemplates.create')
);

const defaultNewTemplateName = computed(() =>
  segment.value ? `${t('contacts.sendEmail.title')}: ${segment.value.name}` : ''
);

async function handleSubmit() {
  if (!segmentId.value) return;
  if (!emailData.value.subject.trim() || !emailData.value.body.trim()) {
    addNotification({
      variant: 'error',
      title: t('form.errorMessages.generic'),
    });
    return;
  }

  const emailId = await ensureSavedEmailId();

  if (shouldSendImmediately.value) {
    await client.segments.email.send(segmentId.value, {
      subject: emailData.value.subject,
      body: emailData.value.body,
      emailId,
    });
  }

  addNotification({
    variant: 'success',
    title: t('contacts.sendEmail.sent'),
  });
  router.push(backUrl.value);
}

async function ensureSavedEmailId(): Promise<string> {
  const name = emailData.value.name.trim() || defaultNewTemplateName.value;
  if (!name.trim()) {
    addNotification({
      variant: 'error',
      title: t('contacts.sendEmail.templateNameRequired'),
    });
    throw new Error('Template name required');
  }

  const created = await client.email.create({
    name,
    subject: emailData.value.subject,
    body: emailData.value.body,
    ...buildCreatePayload(segmentId.value),
  });
  return created.id;
}

async function handleBack() {
  return router.push(backUrl.value);
}

onMounted(async () => {
  if (!segmentId.value) {
    router.replace('/admin/contacts');
    return;
  }
  try {
    const [segmentRes, contactsRes] = await Promise.all([
      client.segments.get(segmentId.value),
      client.segments.contact.list(segmentId.value, {
        limit: PREVIEW_CONTACTS_LIMIT,
        offset: 0,
      }),
    ] as const);
    segment.value = segmentRes;
    segmentContacts.value = contactsRes.items;
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
    router.replace('/admin/contacts');
  } finally {
    loading.value = false;
  }
});
</script>
