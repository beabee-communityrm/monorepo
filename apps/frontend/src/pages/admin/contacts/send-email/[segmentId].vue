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

  <AppApiForm
    v-else-if="segment"
    :button-text="t('contacts.sendEmail.saveAndSend')"
    class="flex flex-col gap-6"
    inline-error
    @submit="handleSubmit"
  >
    <div class="flex flex-col gap-6 md:flex-row md:items-stretch">
      <div class="relative min-w-0 flex-1 md:flex md:min-h-0 md:flex-col">
        <AppLabel
          :label="t('contacts.sendEmail.templateLabel')"
          class="block"
        />
        <AppSelect
          v-model="selectedTemplateId"
          :items="templateSelectItems"
          :placeholder="t('contacts.sendEmail.newEmail')"
          class="w-full"
          @update:model-value="onTemplateChange"
        />
      </div>
      <div
        class="w-full min-w-0 md:flex md:min-h-0 md:w-[600px] md:flex-1 md:flex-col"
      >
        <AppInput
          v-model="templateNameDisplay"
          :label="t('contacts.sendEmail.templateName')"
          :placeholder="defaultNewTemplateName"
          :readonly="!isNewEmailSelected"
          :required="isNewEmailSelected"
        />
      </div>
    </div>

    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      v-model:preview-contact-id="previewContactId"
      :preview-contact-options="segmentContacts"
    />

    <template #buttons="{ disabled }">
      <div class="order-first">
        <AppButton
          type="button"
          variant="primaryOutlined"
          :disabled="disabled"
          @click="(e: Event) => triggerSubmit(e, 'back')"
        >
          {{ t('contacts.sendEmail.saveAndBack') }}
        </AppButton>
      </div>
    </template>
  </AppApiForm>
</template>

<script lang="ts" setup>
import type {
  GetContactData,
  GetEmailData,
  GetSegmentData,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppInput,
  AppLabel,
  AppSelect,
  PageTitle,
  addNotification,
} from '@beabee/vue';

import EmailEditor from '@components/EmailEditor.vue';
import AppApiForm from '@components/forms/AppApiForm.vue';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { extractErrorText } from '@utils/api-error';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const NEW_EMAIL_VALUE = '__new__';

const PREVIEW_CONTACTS_LIMIT = 50;
const TEMPLATES_LIMIT = 100;

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
const pendingAction = ref<'back' | 'send'>('send');

const defaultNewTemplateName = computed(() =>
  segment.value ? `${t('contacts.sendEmail.title')}: ${segment.value.name}` : ''
);

const isNewEmailSelected = computed(
  () => selectedTemplateId.value === NEW_EMAIL_VALUE
);

const selectedTemplate = computed(() =>
  templates.value.find((e) => e.id === selectedTemplateId.value)
);

const templateNameDisplay = computed({
  get: () =>
    isNewEmailSelected.value
      ? newTemplateName.value
      : (selectedTemplate.value?.name ?? ''),
  set: (value: string) => {
    if (isNewEmailSelected.value) {
      newTemplateName.value = value;
    }
  },
});

const templateSelectItems = computed(() => {
  const newOption = {
    id: NEW_EMAIL_VALUE,
    label: t('contacts.sendEmail.newEmail'),
  };
  const templateItems = templates.value.map((email) => ({
    id: email.id,
    label: email.name,
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
        title: t('contacts.sendEmail.templateNameRequired'),
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

function triggerSubmit(evt: Event, action: 'back' | 'send') {
  pendingAction.value = action;
  (evt.currentTarget as HTMLElement).closest('form')?.requestSubmit();
}

async function handleSubmit() {
  if (!segmentId.value || !validateForm()) return;
  if (pendingAction.value === 'back') {
    await ensureSavedEmailId();
    addNotification({
      variant: 'success',
      title: t('contacts.sendEmail.saveAndBackSuccess'),
    });
    router.push(backUrl.value);
    return;
  }
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
