<route lang="yaml">
name: adminContactsEmailTemplatesEdit
meta:
  pageTitle: contacts.emailTemplates.editTitle
  role: admin
</route>

<template>
  <AppConfirmDialog
    :open="showDeleteConfirm"
    :title="t('contacts.emailTemplates.confirmDelete.title')"
    :cancel="t('actions.noBack')"
    :confirm="t('actions.yesDelete')"
    variant="danger"
    @close="showDeleteConfirm = false"
    @confirm="confirmDeleteEmail"
  >
    <p>{{ t('contacts.emailTemplates.confirmDelete.text') }}</p>
  </AppConfirmDialog>

  <PageTitle :title="pageTitle" border />

  <div v-if="loading">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <template v-else>
    <OngoingEmailSettings
      v-model:is-ongoing="isOngoing"
      v-model:trigger="ongoingTrigger"
      v-model:direct-send="ongoingDirectSend"
      :segment-name="segmentName"
    />

    <EmailTemplateEditor
      v-model:email="form"
      :submit-button-text="t('actions.save')"
      :reset-button-text="t('actions.delete')"
      @submit="handleSubmit"
      @reset="showDeleteConfirm = true"
    />
  </template>
</template>

<script lang="ts" setup>
import type {
  GetEmailData,
  SegmentOngoingEmailTrigger,
  UpdateEmailData,
} from '@beabee/beabee-common';
import { AppConfirmDialog, PageTitle, addNotification } from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import OngoingEmailSettings from '#components/emails/OngoingEmailSettings.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

const LIST_ROUTE = { name: 'adminContactsEmailTemplates' as const };

const { t } = useI18n();
const route = useRoute('adminContactsEmailTemplatesEdit');
const router = useRouter();

const emailId = computed(() => route.params.emailId);

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    {
      title: t('contacts.emailTemplates.title'),
      to: router.resolve(LIST_ROUTE).href,
    },
    {
      title: email.value
        ? t('contacts.emailTemplates.editTitleWithName', {
            name: email.value.name,
          })
        : t('contacts.emailTemplates.editTitle'),
    },
  ])
);

const loading = ref(true);
const showDeleteConfirm = ref(false);
const email = ref<GetEmailData | null>(null);
const form = ref<UpdateEmailData>({
  name: '',
  subject: '',
  body: '',
});

// Ongoing email settings
const isOngoing = ref(false);
const ongoingTrigger = ref<SegmentOngoingEmailTrigger>('onJoin');
const ongoingDirectSend = ref(false);
const segmentName = ref<string | undefined>(undefined);
const pageTitle = computed(() => {
  if (!email.value) return t('contacts.emailTemplates.editTitle');
  return t('contacts.emailTemplates.editTitleWithName', {
    name: email.value.name,
  });
});

async function handleSubmit() {
  if (!emailId.value || !email.value) return;
  try {
    const payload: UpdateEmailData = {
      name: form.value.name,
      subject: form.value.subject,
      body: form.value.body,
      isOngoing: isOngoing.value,
      segmentId: isOngoing.value ? email.value?.segmentId : undefined,
      trigger: isOngoing.value ? ongoingTrigger.value : undefined,
    };
    await client.email.update(emailId.value, payload);
    addNotification({ variant: 'success', title: t('form.saved') });
    await router.push(LIST_ROUTE);
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  }
}

async function confirmDeleteEmail() {
  if (!emailId.value) return;
  showDeleteConfirm.value = false;
  try {
    await client.email.delete(emailId.value);
    addNotification({
      variant: 'success',
      title: t('emails.notifications.deleted'),
    });
    await router.push(LIST_ROUTE);
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  }
}

async function loadEmail() {
  if (!emailId.value) return;
  const data = await client.email.get(emailId.value);
  email.value = data;
  form.value = {
    name: data.name,
    subject: data.subject,
    body: data.body,
  };

  // Load ongoing email settings
  isOngoing.value = !!data.isOngoing;
  ongoingTrigger.value = data.trigger || 'onJoin';
  segmentName.value = data.segmentName;
}

onMounted(async () => {
  if (!emailId.value) {
    await router.replace(LIST_ROUTE);
    return;
  }
  try {
    await loadEmail();
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
    await router.replace(LIST_ROUTE);
  } finally {
    loading.value = false;
  }
});
</script>
