<route lang="yaml">
name: adminEmailsTemplateEdit
meta:
  role: admin
  pageTitle: emails.edit.title
</route>

<template>
  <PageTitle :title="pageTitle" back border>
    <div v-if="hasOverride" class="flex-0 ml-3">
      <AppButton variant="dangerOutlined" @click="handleReset">
        {{ t('emails.actions.resetToDefault') }}
      </AppButton>
    </div>
  </PageTitle>

  <div v-if="loading">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <AppForm
    v-else-if="emailData"
    :button-text="t('actions.save')"
    @submit="handleSubmit"
  >
    <!-- Template Info (read-only) -->
    <div class="mb-6 max-w-2xl">
      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium text-body-80">
          {{ t('emails.name') }}
        </label>
        <p class="text-body">{{ t(`emails.templates.names.${templateId}`) }}</p>
      </div>

      <!-- Available merge fields -->
      <div v-if="mergeFields.length > 0" class="rounded bg-primary-5 p-4">
        <p class="mb-2 text-sm font-medium text-body-80">
          {{ t('emails.templates.availableFields') }}:
        </p>
        <div class="flex flex-wrap gap-2">
          <code
            v-for="field in mergeFields"
            :key="field"
            class="rounded bg-primary-10 px-2 py-1 text-xs"
          >
            *|{{ field }}|*
          </code>
        </div>
      </div>
    </div>

    <!-- Email Editor -->
    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      :server-render="{ type: templateType, templateId }"
      :heading="t('emailEditor.body.label')"
    />
  </AppForm>
</template>

<script lang="ts" setup>
import type {
  GetEmailData,
  GetEmailTemplateInfoData,
} from '@beabee/beabee-common';
import { AppButton, AppForm, PageTitle } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import EmailEditor from '@components/EmailEditor.vue';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const templateId = computed(() => {
  const param = (route.params as Record<string, string | string[]>).id;
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
});

const loading = ref(true);
const emailData = ref<GetEmailData | null>(null);
const templateInfo = ref<GetEmailTemplateInfoData | null>(null);

const hasOverride = computed(() => templateInfo.value?.hasOverride ?? false);
const mergeFields = computed(() => templateInfo.value?.mergeFields ?? []);
const templateType = computed(() => templateInfo.value?.type ?? 'general');

const pageTitle = computed(() => {
  if (!templateId.value) return t('emails.edit.title');
  return t(`emails.templates.names.${templateId.value}`);
});

addBreadcrumb(
  computed(() => [
    { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
    { title: t('emails.tabs.templates'), to: '/admin/emails/templates' },
    { title: pageTitle.value },
  ])
);

onMounted(async () => {
  try {
    // Load template metadata
    const templates = await client.email.getTemplates();
    templateInfo.value =
      templates.find((t) => t.id === templateId.value) || null;

    if (!templateInfo.value) {
      addNotification({
        variant: 'error',
        title: t('notifications.error'),
      });
      router.push('/admin/emails/templates');
      return;
    }

    // Load email data (override or default)
    emailData.value = await client.email.get(templateId.value);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  if (!emailData.value) return;

  try {
    await client.email.update(templateId.value, {
      subject: emailData.value.subject,
      body: emailData.value.body,
    });

    addNotification({
      variant: 'success',
      title: t('emails.notifications.updated'),
    });

    // Reload to get updated hasOverride status
    const templates = await client.email.getTemplates();
    templateInfo.value =
      templates.find((t) => t.id === templateId.value) || null;
    emailData.value = await client.email.get(templateId.value);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}

async function handleReset() {
  if (
    !confirm(
      `${t('emails.confirmResetToDefault.title')}\n\n${t('emails.confirmResetToDefault.message')}`
    )
  ) {
    return;
  }

  try {
    await client.email.delete(templateId.value);

    addNotification({
      variant: 'success',
      title: t('emails.notifications.resetToDefault'),
    });

    // Reload template data (now shows default)
    const templates = await client.email.getTemplates();
    templateInfo.value =
      templates.find((t) => t.id === templateId.value) || null;
    emailData.value = await client.email.get(templateId.value);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}
</script>
