<route lang="yaml">
name: adminContactsSendEmailSegmentId
meta:
  pageTitle: contacts.sendEmail.title
  role: admin
</route>

<template>
  <PageTitle :title="pageTitle" back border>
    <template #back>
      <router-link :to="backUrl">{{ t('actions.back') }}</router-link>
    </template>
  </PageTitle>

  <div v-if="loading" class="p-4">
    <p>{{ t('common.loading') }}...</p>
  </div>

  <template v-else-if="segment">
    <div class="mb-6 flex flex-wrap items-center gap-2">
      <AppLabel
        :label="t('contacts.sendEmail.previewAsContact')"
        class="mb-0"
      />
      <AppSelect
        v-model="previewContactId"
        class="min-w-[200px]"
        :items="previewContactItems"
        :placeholder="t('contacts.sendEmail.previewAsContact')"
      />
    </div>

    <EmailEditor
      v-model:subject="emailData.subject"
      v-model:content="emailData.body"
      :preview-contact-id="previewContactId || undefined"
    />

    <div class="mt-6">
      <AppAsyncButton
        variant="primaryOutlined"
        :disabled="!emailData.subject.trim() || !emailData.body.trim()"
        @click="handleSend"
      >
        {{ t('contacts.sendEmail.send') }}
      </AppAsyncButton>
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { GetContactData, GetSegmentDataWith } from '@beabee/beabee-common';
import {
  AppAsyncButton,
  AppLabel,
  AppSelect,
  PageTitle,
  addNotification,
} from '@beabee/vue';

import EmailEditor from '@components/EmailEditor.vue';
import { client } from '@utils/api';
import { isApiError } from '@utils/api';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const segmentId = computed(() => {
  const param = (route.params as Record<string, string | string[]>).segmentId;
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
});

const backUrl = computed(
  () => `/admin/contacts${segmentId.value ? `?segment=${segmentId.value}` : ''}`
);

const pageTitle = computed(() => {
  if (!segment.value) return t('contacts.sendEmail.title');
  return `${t('contacts.sendEmail.title')}: ${segment.value.name}`;
});

const loading = ref(true);
const segment = ref<GetSegmentDataWith<void> | null>(null);
const segmentContacts = ref<GetContactData[]>([]);
const emailData = ref({ subject: '', body: '' });
const previewContactId = ref<string>('');

const previewContactItems = computed(() => {
  const items: { id: string; label: string }[] = [
    { id: '', label: t('contacts.sendEmail.previewAsContact') },
    ...segmentContacts.value.map((c, i) => ({
      id: c.id,
      label:
        `${c.firstname} ${c.lastname}`.trim() || c.email || `Contact ${i + 1}`,
    })),
  ];
  return items;
});

onMounted(async () => {
  if (!segmentId.value) {
    router.replace('/admin/contacts');
    return;
  }
  try {
    segment.value = await client.segments.get(segmentId.value);
    const result = await client.segments.contact.list(segmentId.value, {
      limit: 50,
      offset: 0,
    });
    segmentContacts.value = result.items;
    if (result.items.length > 0 && !previewContactId.value) {
      previewContactId.value = result.items[0].id;
    }
  } catch (err) {
    if (isApiError(err, undefined, [404])) {
      addNotification({
        variant: 'error',
        title: t('notifications.error'),
      });
      router.replace('/admin/contacts');
    } else {
      throw err;
    }
  } finally {
    loading.value = false;
  }
});

async function handleSend() {
  if (
    !segmentId.value ||
    !emailData.value.subject.trim() ||
    !emailData.value.body.trim()
  ) {
    return;
  }
  try {
    await client.segments.email.send(segmentId.value, {
      subject: emailData.value.subject,
      body: emailData.value.body,
    });
    addNotification({
      variant: 'success',
      title: t('contacts.sendEmail.sent'),
    });
    router.push(backUrl.value);
  } catch {
    addNotification({
      variant: 'error',
      title: t('notifications.error'),
    });
  }
}
</script>
