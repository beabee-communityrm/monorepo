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
    <router-link :to="listUrl">{{ t('actions.back') }}</router-link>
  </PageTitle>

  <div v-if="loading">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <AppApiForm
    v-else-if="email"
    :button-text="t('actions.save')"
    class="flex flex-col gap-6"
    inline-error
    @submit="handleSubmit"
  >
    <AppInput
      v-model="form.name"
      :label="t('contacts.emailTemplates.name')"
      required
    />

    <EmailEditor v-model:subject="form.subject" v-model:content="form.body" />

    <template #buttons>
      <div class="order-first">
        <AppButton
          type="button"
          variant="dangerOutlined"
          :icon="faTrash"
          @click="showDeleteConfirm = true"
        >
          {{ t('actions.delete') }}
        </AppButton>
      </div>
    </template>
  </AppApiForm>
</template>

<script lang="ts" setup>
import type { GetEmailData } from '@beabee/beabee-common';
import {
  AppButton,
  AppConfirmDialog,
  AppInput,
  PageTitle,
  addNotification,
} from '@beabee/vue';

import EmailEditor from '@components/EmailEditor.vue';
import AppApiForm from '@components/forms/AppApiForm.vue';
import { faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { extractErrorText } from '@utils/api-error';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute('adminContactsEmailTemplatesEdit');
const router = useRouter();

const listUrl = '/admin/contacts/email-templates';

const emailId = computed(() => route.params.emailId as string);

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    { title: t('contacts.emailTemplates.title'), to: listUrl },
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
const form = ref({
  name: '',
  subject: '',
  body: '',
});

const pageTitle = computed(() => {
  if (!email.value) return t('contacts.emailTemplates.editTitle');
  return t('contacts.emailTemplates.editTitleWithName', {
    name: email.value.name,
  });
});

async function handleSubmit() {
  if (!emailId.value || !email.value) return;
  try {
    await client.email.update(emailId.value, {
      ...form.value,
    } as Parameters<typeof client.email.update>[1]);
    addNotification({
      variant: 'success',
      title: t('form.saved'),
    });
    router.push(listUrl);
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
    router.push(listUrl);
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  }
}

onMounted(async () => {
  if (!emailId.value) {
    router.replace(listUrl);
    return;
  }
  try {
    const data = await client.email.get(emailId.value);
    email.value = data;
    form.value = {
      name: data.name,
      subject: data.subject,
      body: data.body,
    };
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
    router.replace(listUrl);
  } finally {
    loading.value = false;
  }
});
</script>
