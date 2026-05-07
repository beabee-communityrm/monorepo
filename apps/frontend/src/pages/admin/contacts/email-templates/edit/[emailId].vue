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

  <PageTitle :title="pageTitle" border>
    <div class="flex flex-wrap gap-2">
      <AppApiAsyncButton
        v-if="email?.isOngoing"
        :icon="email.enabled ? faPause : faPlay"
        :success-text="
          email.enabled
            ? t('contacts.emailTemplates.toggleEnabled.enabled')
            : t('contacts.emailTemplates.toggleEnabled.disabled')
        "
        @click="handleToggleEnabled"
      >
        {{ email.enabled ? t('actions.disable') : t('actions.enable') }}
      </AppApiAsyncButton>
      <ActionButton :icon="faTrash" @click="showDeleteConfirm = true">
        {{ t('actions.delete') }}
      </ActionButton>
    </div>
  </PageTitle>

  <div v-if="!email">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <template v-else>
    <OngoingEmailSummary
      class="mb-4"
      :email="email"
      :segment-id="email.segmentId"
      :segment-name="email.segmentName"
      mode="edit"
    />

    <AppInfoList v-if="email" class="mb-4">
      <AppInfoListItem
        :name="t('emails.isOngoing')"
        :value="
          !email.isOngoing
            ? t('emails.sendType.oneOff')
            : email.enabled
              ? t('emails.sendType.ongoing')
              : t('emails.sendType.paused')
        "
      />
      <AppInfoListItem
        v-if="email.isOngoing && email.segmentId"
        :name="t('adminSettings.email.contactTemplates.segment')"
      >
        <router-link
          :to="`/admin/contacts?segment=${email.segmentId}`"
          class="text-link"
        >
          {{ email.segmentName }}
        </router-link>
      </AppInfoListItem>
      <AppInfoListItem
        v-if="email.isOngoing"
        :name="t('adminSettings.email.contactTemplates.titleSendTime')"
        :value="
          email.trigger === 'onLeave'
            ? t('adminSettings.email.contactTemplates.contactLeaves')
            : t('adminSettings.email.contactTemplates.contactJoins')
        "
      />
      <AppInfoListItem
        :name="t('emails.mailingCount')"
        :value="email.mailingCount ?? 0"
      />
      <AppInfoListItem
        :name="t('contacts.emailTemplates.date')"
        :value="formatLocale(new Date(email.date), 'PP')"
      />
    </AppInfoList>

    <AppApiForm
      :button-text="t('actions.save')"
      :success-text="t('form.saved')"
      inline-error
      @submit="handleSubmit"
    >
      <EmailTemplateEditor v-model:email="form" />
    </AppApiForm>
  </template>
</template>

<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import {
  ActionButton,
  AppConfirmDialog,
  AppInfoList,
  AppInfoListItem,
  PageTitle,
  formatLocale,
} from '@beabee/vue';

import {
  faPause,
  faPlay,
  faTrash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import AppApiAsyncButton from '#components/button/AppApiAsyncButton.vue';
import EmailTemplateEditor from '#components/emails/EmailTemplateEditor.vue';
import OngoingEmailSummary from '#components/emails/OngoingEmailSummary.vue';
import AppApiForm from '#components/forms/AppApiForm.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';

const LIST_ROUTE = { name: 'adminContactsEmailTemplates' as const };

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const emailId = computed(() => route.params.emailId as string);

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

const showDeleteConfirm = ref(false);
const email = ref<GetEmailData | null>(null);
const form = ref({
  name: '',
  fromName: null as string | null,
  fromEmail: null as string | null,
  subject: '',
  body: '',
});

const pageTitle = computed(() => {
  if (!email.value) return t('contacts.emailTemplates.editTitle');
  return t('contacts.emailTemplates.editTitleWithName', {
    name: email.value.name,
  });
});

async function handleToggleEnabled() {
  if (!email.value) return;

  email.value = await client.email.update(emailId.value, {
    ongoingEmail: {
      isOngoing: email.value.isOngoing,
      segmentId: email.value.segmentId,
      trigger: email.value.trigger,
      enabled: !email.value.enabled,
    },
  });
}

async function handleSubmit() {
  if (!email.value) return;
  email.value = await client.email.update(emailId.value, form.value);
}

async function confirmDeleteEmail() {
  showDeleteConfirm.value = false;
  await client.email.delete(emailId.value);
  await router.push(LIST_ROUTE);
}

onMounted(async () => {
  const data = await client.email.get(emailId.value);
  email.value = data;
  form.value = {
    fromName: data.fromName,
    fromEmail: data.fromEmail,
    name: data.name,
    subject: data.subject,
    body: data.body,
  };
});
</script>
