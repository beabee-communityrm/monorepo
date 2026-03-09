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

  <div class="flex flex-col gap-6 md:flex-row md:items-stretch">
    <div class="relative min-w-0 flex-1 md:flex md:min-h-0 md:flex-col">
      <AppRadioGroup
        v-model="emailSettingType"
        :options="[
          ['one-off', t('adminSettings.email.contactTemplates.oneOff')],
          ['ongoing', t('adminSettings.email.contactTemplates.ongoing')],
        ]"
        :variant="'link'"
        :disabled="false"
        :label="t('adminSettings.email.contactTemplates.titleEmailType')"
        :inline="true"
        :required="false"
      />
    </div>
    <div
      v-if="emailSettingType === 'ongoing'"
      class="relative min-w-0 flex-1 md:flex md:min-h-0 md:flex-col"
    >
      <AppRadioGroup
        v-model="emailSettingSendTime"
        :options="[
          [
            'contact-joins',
            t('adminSettings.email.contactTemplates.contactJoins'),
          ],
          [
            'contact-leaves',
            t('adminSettings.email.contactTemplates.contactLeaves'),
          ],
        ]"
        :variant="'link'"
        :disabled="false"
        :label="t('adminSettings.email.contactTemplates.titleSendTime')"
        :inline="true"
        :required="false"
      />
      <AppCheckbox
        v-if="emailSettingSendTime === 'contact-joins'"
        v-model="emailSettingDirectSend"
        class="mt-2"
        :variant="'link'"
        :disabled="false"
        :label="t('adminSettings.email.contactTemplates.titleDirectSend')"
        :required="false"
      />
      <p class="mt-2 text-sm text-body-80">
        {{ t('adminSettings.email.contactTemplates.descriptionOngoingEmails') }}
      </p>
    </div>
  </div>
  <EmailTemplateEditor
    v-model:email="emailData"
    class="mt-4"
    :submit-button-text="submitButtonText"
    :reset-button-text="t('actions.goBack')"
    show-select-template
    :save-preview="savePreview"
    :contacts="segmentContacts"
    :default-new-template-name="defaultNewTemplateName"
    @submit="handleSubmit"
    @reset="handleBack"
  />
</template>

<script lang="ts" setup>
import type {
  GetContactData,
  GetEmailData,
  GetSegmentData,
} from '@beabee/beabee-common';
import {
  AppCheckbox,
  AppRadioGroup,
  PageTitle,
  addNotification,
} from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

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

const sendEmail = computed(() =>
  emailSettingType.value === 'one-off' ||
  (emailSettingDirectSend.value &&
    emailSettingSendTime.value === 'contact-joins')
    ? true
    : false
);

const submitButtonText = computed(() =>
  sendEmail.value
    ? t('adminSettings.email.contactTemplates.send')
    : t('adminSettings.email.contactTemplates.create')
);

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
const emailData = ref({ name: '', subject: '', body: '' });
const pendingAction = ref<'back' | 'send'>('send');
const savePreview = ref(true);

const defaultNewTemplateName = computed(() =>
  segment.value ? `${t('contacts.sendEmail.title')}: ${segment.value.name}` : ''
);

const isNewEmailSelected = computed(
  () => selectedTemplateId.value === NEW_EMAIL_VALUE
);

async function loadTemplates() {
  const result = await client.email.list({
    limit: TEMPLATES_LIMIT,
    offset: 0,
  });
  templates.value = result.items;
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
    const isOngoing = emailSettingType.value === 'ongoing';
    const created = await client.email.create({
      name: emailData.value.name,
      subject: emailData.value.subject,
      body: emailData.value.body,
      isOngoing: isOngoing,
      segmentId: isOngoing ? segmentId.value : undefined,
      trigger: isOngoing ? emailSettingSendTime.value : undefined,
    });
    return created.id;
  }
  await client.email.update(selectedTemplateId.value, {
    name: emailData.value.name,
    subject: emailData.value.subject,
    body: emailData.value.body,
  });
  return selectedTemplateId.value;
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
  if (sendEmail.value) {
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

// ** Send State Management **/
const emailSettingType = ref<string>('one-off');
const emailSettingSendTime = ref<string>('contact-joins');
const emailSettingDirectSend = ref<boolean>(false);
</script>
