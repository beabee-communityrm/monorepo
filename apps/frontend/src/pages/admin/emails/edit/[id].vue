<route lang="yaml">
name: adminEmailsEdit
meta:
  role: admin
  pageTitle: emails.edit.title
</route>

<template>
  <PageTitle :title="pageTitle" back border>
    <div class="flex-0 ml-3">
      <AppButton :icon="faTrash" variant="danger" @click="handleDelete">
        {{ t('actions.delete') }}
      </AppButton>
    </div>
  </PageTitle>

  <div v-if="!emailData">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <AppForm v-else :button-text="t('actions.save')" @submit="handleSubmit">
    <!-- Custom Email Fields -->
    <div class="mb-6 max-w-2xl">
      <AppInput
        v-model="emailData.name"
        :label="t('emails.name')"
        required
        class="mb-4"
      />
      <AppInput
        :model-value="emailData.fromName || undefined"
        :label="t('emails.fromName')"
        class="mb-4"
        @update:model-value="emailData.fromName = $event || null"
      />
      <AppInput
        :model-value="emailData.fromEmail || undefined"
        :label="t('emails.fromEmail')"
        type="email"
        class="mb-4"
        @update:model-value="emailData.fromEmail = $event || null"
      />
    </div>

    <!-- Email Editor -->
    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      :server-render="{ type: 'general' }"
      :heading="t('emailEditor.body.label')"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import type {
  GetEmailWithMetadataData,
  UpdateEmailData,
} from '@beabee/beabee-common';
import { AppButton, AppForm, AppInput, PageTitle } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import { faEnvelope, faTrash } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const emailId = (() => {
  const param = (route.params as Record<string, string | string[]>).id;
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
})();

const emailData = ref<GetEmailWithMetadataData | null>(null);

const pageTitle = computed(() => {
  if (!emailData.value) return t('emails.edit.title');
  return t('emails.edit.titleCustom', { name: emailData.value.name });
});

addBreadcrumb(
  computed(() => [
    { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
    { title: pageTitle.value },
  ])
);

onMounted(async () => {
  try {
    // Load email data
    emailData.value = await client.email.get(emailId);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
});

async function handleSubmit() {
  if (!emailData.value) return;

  try {
    // Update email content
    const updateData: UpdateEmailData = {
      subject: emailData.value.subject,
      body: emailData.value.body,
    };

    await client.email.update(emailId, updateData);
    addNotification({
      variant: 'success',
      title: t('emails.notifications.updated'),
    });

    // Reload data
    emailData.value = await client.email.get(emailId);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}

async function handleDelete() {
  if (!emailData.value) return;

  const confirmMessage =
    emailData.value.mailingCount && emailData.value.mailingCount > 0
      ? t('emails.confirmDelete.messageWithMailings', {
          count: emailData.value.mailingCount,
        })
      : t('emails.confirmDelete.message');

  if (confirm(`${t('emails.confirmDelete.title')}\n\n${confirmMessage}`)) {
    try {
      await client.email.delete(emailId);
      addNotification({
        variant: 'success',
        title: t('emails.notifications.deleted'),
      });
      router.push('/admin/emails/custom');
    } catch {
      addNotification({
        variant: 'error',
        title: t('notifications.error'),
      });
    }
  }
}
</script>
