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

  <div v-else-if="segment">
    <AppSubHeading>
      {{ t('adminSettings.email.contactTemplates.sendSettings') }}
    </AppSubHeading>
    <AppRadioGroup
      v-model="emailData.isOngoing"
      :options="[
        [
          false,
          t('adminSettings.email.contactTemplates.sendTypes.oneOffLabel'),
        ],
        [
          true,
          t('adminSettings.email.contactTemplates.sendTypes.ongoingLabel'),
        ],
      ]"
      variant="link"
      :label="t('adminSettings.email.contactTemplates.sendTypes.title')"
      :inline="true"
      required
      class="mb-4"
    />
    <AppApiForm
      :button-text="submitButtonText"
      :reset-button-text="t('actions.goBack')"
      :success-text="successText"
      inline-error
      @submit="handleSubmit"
      @reset="handleBack"
    >
      <EmailTemplateEditor
        v-model:email="formData"
        v-model:selected-email-id="selectedEmailId"
        show-select-template
        :contacts="segmentContacts"
      />
      <template v-if="emailData.isOngoing">
        <AppRadioGroup
          v-model="emailData.trigger"
          :options="[
            ['onJoin', t('adminSettings.email.contactTemplates.contactJoins')],
            [
              'onLeave',
              t('adminSettings.email.contactTemplates.contactLeaves'),
            ],
          ]"
          variant="link"
          :label="t('adminSettings.email.contactTemplates.titleSendTime')"
          :inline="true"
          required
          class="mb-4"
        />
      </template>
      <App2ColGrid
        v-if="emailData.trigger === 'onJoin' && emailData.isOngoing"
        class="mb-4"
      >
        <template #col1>
          <AppToggleField
            v-model="emailData.directSend"
            variant="link"
            :label="t('adminSettings.email.contactTemplates.titleDirectSend')"
            :disabled-description="
              t('adminSettings.email.contactTemplates.directSendDisabled')
            "
            :enabled-description="
              t('adminSettings.email.contactTemplates.directSendEnabled')
            "
          />
        </template>
      </App2ColGrid>
      <OngoingEmailSummary
        class="mb-4"
        :email="emailData"
        :direct-send="emailData.directSend"
        :segment-id="segmentId"
        :segment-name="segment.name"
        mode="send"
      />
    </AppApiForm>
  </div>
</template>

<script lang="ts" setup>
import {
  type GetContactData,
  type GetSegmentData,
  type SegmentOngoingEmailTrigger,
} from '@beabee/beabee-common';
import {
  App2ColGrid,
  AppRadioGroup,
  AppSubHeading,
  AppToggleField,
  PageTitle,
  addNotification,
} from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import OngoingEmailSummary from '#components/emails/OngoingEmailSummary.vue';
import AppApiForm from '#components/forms/AppApiForm.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

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

const emailData = reactive({
  enabled: true,
  isOngoing: false,
  trigger: 'onJoin' as SegmentOngoingEmailTrigger,
  directSend: false,
});

const formData = ref({
  name: '',
  fromName: null,
  fromEmail: null,
  subject: '',
  body: '',
});

const selectedEmailId = ref<string | undefined>(undefined);

const shouldSendImmediately = computed(
  () =>
    !emailData.isOngoing ||
    (emailData.directSend && emailData.trigger === 'onJoin')
);

const submitButtonText = computed(() =>
  shouldSendImmediately.value
    ? t('adminSettings.email.contactTemplates.send')
    : t('adminSettings.email.contactTemplates.create')
);

const successText = computed(() =>
  shouldSendImmediately.value
    ? t('contacts.sendEmail.sent')
    : t('emails.notifications.created')
);

async function handleSubmit() {
  const emailId = await ensureSavedEmailId();

  if (shouldSendImmediately.value) {
    await client.segments.email.send(segmentId.value, {
      subject: formData.value.subject,
      body: formData.value.body,
      emailId,
      // Only track contacts when this is the initial send of an ongoing
      // email, so process-segments won't re-send to these contacts.
      ongoingDirectSend: emailData.isOngoing ? true : undefined,
    });
  }

  router.push(backUrl.value);
}

async function ensureSavedEmailId(): Promise<string> {
  const emailPayload = {
    ...formData.value,
    ongoingEmail: {
      isOngoing: emailData.isOngoing,
      ...(emailData.isOngoing && {
        segmentId: segmentId.value,
        trigger: emailData.trigger,
        enabled: true,
      }),
    },
  };

  // Update existing template if one was selected
  if (selectedEmailId.value) {
    await client.email.update(selectedEmailId.value, emailPayload);
    return selectedEmailId.value;
  } else {
    const created = await client.email.create(emailPayload);
    return created.id;
  }
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
    formData.value.name = `${t('contacts.sendEmail.title')}: ${segment.value.name}`;
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
