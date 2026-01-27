<route lang="yaml">
name: adminEmailsTemplateEdit
meta:
  role: admin
  pageTitle: emails.edit.title
</route>

<template>
  <AppConfirmDialog
    :open="showResetConfirmDialog"
    :title="
      templateInfo?.hasDefaultTemplate
        ? t('emails.confirmResetToDefault.title')
        : t('emails.confirmDelete.title')
    "
    :cancel="t('actions.noBack')"
    :confirm="
      templateInfo?.hasDefaultTemplate
        ? t('actions.yesReset')
        : t('actions.yesDisable')
    "
    variant="danger"
    @close="showResetConfirmDialog = false"
    @confirm="handleReset"
  >
    <p>
      {{
        templateInfo?.hasDefaultTemplate
          ? t('emails.confirmResetToDefault.message')
          : t('emails.confirmDelete.message')
      }}
    </p>
  </AppConfirmDialog>

  <PageTitle :title="pageTitle" back border>
    <div v-if="hasOverride" class="flex-0 ml-3">
      <AppButton
        variant="dangerOutlined"
        @click="showResetConfirmDialog = true"
      >
        {{
          templateInfo?.hasDefaultTemplate
            ? t('emails.actions.resetToDefault')
            : t('emails.actions.deactivate')
        }}
      </AppButton>
    </div>
  </PageTitle>

  <div v-if="loading">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <AppApiForm
    v-else-if="emailData"
    :button-text="t('actions.save')"
    @submit="handleSubmit"
  >
    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      :template="{ type: templateType, id: templateId }"
      :heading="t('emailEditor.body.label')"
    />
  </AppApiForm>
</template>

<script lang="ts" setup>
import type { GetEmailTemplateInfoData } from '@beabee/beabee-common';
import { AppButton, AppConfirmDialog, PageTitle } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import EmailEditor from '@components/EmailEditor.vue';
import AppApiForm from '@components/forms/AppApiForm.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import { client, isApiError } from '@utils/api';
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
const emailData = ref<{ subject: string; body: string } | null>(null);
const templateInfo = ref<GetEmailTemplateInfoData | null>(null);

const hasOverride = computed(() => templateInfo.value?.hasOverride ?? false);
const templateType = computed(() => templateInfo.value?.type ?? 'general');

const pageTitle = computed(() => {
  if (!templateId.value) return t('emails.edit.title');
  return t(`emails.templates.names.${templateId.value}`);
});

const showResetConfirmDialog = ref(false);

addBreadcrumb(computed(() => [{ title: 'Email' }, { title: pageTitle.value }]));

onMounted(async () => {
  try {
    // Load template metadata
    const templates = await client.email.template.list();
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
    emailData.value = await loadEmail(templateId.value);
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
    await client.email.template.update(templateId.value, {
      subject: emailData.value.subject,
      body: emailData.value.body,
    });

    addNotification({
      variant: 'success',
      title: t('emails.notifications.updated'),
    });

    // Reload to get updated hasOverride status
    const templates = await client.email.template.list();
    templateInfo.value =
      templates.find((t) => t.id === templateId.value) || null;
    emailData.value = await loadEmail(templateId.value);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}

async function handleReset() {
  try {
    await client.email.template.delete(templateId.value);

    addNotification({
      variant: 'success',
      title: t('emails.notifications.resetToDefault'),
    });

    // Reload template data (now shows default)
    const templates = await client.email.template.list();
    templateInfo.value =
      templates.find((t) => t.id === templateId.value) || null;
    emailData.value = await loadEmail(templateId.value);

    showResetConfirmDialog.value = false;
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}

async function loadEmail(
  templateId: string
): Promise<{ subject: string; body: string }> {
  try {
    const email = await client.email.template.get(templateId);
    return { subject: email.subject, body: email.body };
  } catch (err) {
    if (isApiError(err, undefined, [404])) {
      return { subject: '', body: '' };
    } else {
      throw err;
    }
  }
}
</script>
