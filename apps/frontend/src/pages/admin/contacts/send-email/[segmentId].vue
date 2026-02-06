<route lang="yaml">
name: adminContactsSendEmailSegmentId
meta:
  pageTitle: contacts.sendEmail.title
  role: admin
</route>

<template>
  <PageTitle :title="pageTitle" border>
    <router-link :to="backUrl">{{ t('actions.back') }}</router-link>
  </PageTitle>

  <div v-if="loading">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <form v-else-if="segment" class="flex flex-col gap-6" @submit.prevent>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div class="min-w-0 flex-1">
          <AppSelect
            v-model="selectedTemplateId"
            :items="templateSelectItems"
            :placeholder="t('contacts.sendEmail.newEmail')"
            class="w-full"
            @update:model-value="onTemplateChange"
          />
        </div>
        <div v-if="isNewEmailSelected" class="min-w-0 flex-1 sm:max-w-xs">
          <AppInput
            v-model="newTemplateName"
            :label="t('contacts.sendEmail.templateName')"
            :placeholder="defaultNewTemplateName"
            required
          />
        </div>
      </div>
    </div>

    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      v-model:preview-contact-id="previewContactId"
      :preview-contact-options="segmentContacts"
    />

    <div class="flex flex-wrap gap-3">
      <AppAsyncButton :on-click="handleSaveAndBack" variant="primaryOutlined">
        {{ t('contacts.sendEmail.saveAndBack') }}
      </AppAsyncButton>
      <AppAsyncButton :on-click="handleSaveAndSend" variant="primary">
        {{ t('contacts.sendEmail.saveAndSend') }}
      </AppAsyncButton>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type {
  GetContactData,
  GetEmailData,
  GetSegmentData,
} from '@beabee/beabee-common';
import {
  AppAsyncButton,
  AppInput,
  AppSelect,
  PageTitle,
  addNotification,
} from '@beabee/vue';

import EmailEditor from '@components/EmailEditor.vue';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { extractErrorText } from '@utils/api-error';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const NEW_EMAIL_VALUE = '__new__';

const PREVIEW_CONTACTS_LIMIT = 50;
const TEMPLATES_LIMIT = 500;

const { t } = useI18n();
const route = useRoute('adminContactsSendEmailSegmentId');
const router = useRouter();

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

const segmentId = computed(() => route.params.segmentId);

const backUrl = computed(
  () => `/admin/contacts${segmentId.value ? `?segment=${segmentId.value}` : ''}`
);

const pageTitle = computed(() => {
  if (!segment.value) return t('contacts.sendEmail.title');
  return `${t('contacts.sendEmail.title')}: ${segment.value.name}`;
});

const loading = ref(true);
const segment = ref<GetSegmentData | null>(null);
const segmentContacts = ref<GetContactData[]>([]);
const templates = ref<GetEmailData[]>([]);
const selectedTemplateId = ref<string>(NEW_EMAIL_VALUE);
const newTemplateName = ref('');
const emailData = ref({ subject: '', body: '' });
const previewContactId = ref<string>('');

const defaultNewTemplateName = computed(
  () =>
    (segment.value
      ? t('contacts.sendEmail.title') + ': ' + segment.value.name
      : '') as string
);

const isNewEmailSelected = computed(
  () => selectedTemplateId.value === NEW_EMAIL_VALUE
);

const templateSelectItems = computed(() => {
  const newOption = {
    id: NEW_EMAIL_VALUE,
    label: t('contacts.sendEmail.newEmail'),
  };
  const templateItems = templates.value.map((email) => ({
    id: email.id,
    label:
      email.mailingCount != null && email.mailingCount > 0
        ? `${email.name} (${t('contacts.sendEmail.sentTimes', {
            n: email.mailingCount,
          })})`
        : email.name,
  }));
  return [newOption, ...templateItems];
});

async function loadTemplates() {
  const result = await client.email.list({
    limit: TEMPLATES_LIMIT,
    offset: 0,
  });
  templates.value = result.items;
}

function onTemplateChange(value: string) {
  if (value === NEW_EMAIL_VALUE) {
    newTemplateName.value = defaultNewTemplateName.value;
    return;
  }
  const template = templates.value.find((e) => e.id === value);
  if (template) {
    emailData.value = { subject: template.subject, body: template.body };
  }
}

function validateForm(): boolean {
  if (!emailData.value.subject.trim() || !emailData.value.body.trim()) {
    addNotification({
      variant: 'error',
      title: t('form.errorMessages.generic'),
    });
    return false;
  }
  return true;
}

async function ensureSavedEmailId(): Promise<string> {
  if (selectedTemplateId.value === NEW_EMAIL_VALUE) {
    const name = newTemplateName.value.trim() || defaultNewTemplateName.value;
    if (!name.trim()) {
      addNotification({
        variant: 'error',
        title: t('contacts.sendEmail.templateName'),
      });
      throw new Error('Template name required');
    }
    const created = await client.email.create({
      name,
      subject: emailData.value.subject,
      body: emailData.value.body,
    });
    return created.id;
  }
  await client.email.update(selectedTemplateId.value, {
    subject: emailData.value.subject,
    body: emailData.value.body,
  });
  return selectedTemplateId.value;
}

async function handleSaveAndBack() {
  if (!segmentId.value || !validateForm()) return;
  await ensureSavedEmailId();
  addNotification({
    variant: 'success',
    title: t('contacts.sendEmail.saveAndBackSuccess'),
  });
  router.push(backUrl.value);
}

async function handleSaveAndSend() {
  if (!segmentId.value || !validateForm()) return;
  const emailId = await ensureSavedEmailId();
  await client.segments.email.send(segmentId.value, {
    subject: emailData.value.subject,
    body: emailData.value.body,
    emailId,
  });
  addNotification({
    variant: 'success',
    title: t('contacts.sendEmail.sent'),
  });
  router.push(backUrl.value);
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
      loadTemplates(),
    ] as const);
    segment.value = segmentRes;
    segmentContacts.value = contactsRes.items;
    newTemplateName.value = defaultNewTemplateName.value;
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

watch(defaultNewTemplateName, (name) => {
  if (isNewEmailSelected.value && !newTemplateName.value) {
    newTemplateName.value = name;
  }
});
</script>
