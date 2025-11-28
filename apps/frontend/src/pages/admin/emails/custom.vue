<route lang="yaml">
name: adminEmailsCustom
meta:
  role: admin
  pageTitle: emails.tabs.custom
</route>

<template>
  <AppPaginatedTable
    v-model:query="currentPaginatedQuery"
    keypath="emails.list.showingOf"
    :headers="headers"
    :result="emailsTable"
  >
    <template #actions>
      <AppButtonGroup>
        <AppButton
          :icon="faPlus"
          variant="primaryOutlined"
          :title="t('emails.actions.addCustom')"
          to="/admin/emails/add"
        />
      </AppButtonGroup>
    </template>
    <template #value-name="{ item, value }">
      <router-link
        :to="'/admin/emails/edit/' + item.id"
        class="text-base font-bold text-link"
      >
        {{ value }}
      </router-link>
    </template>
    <template #value-mailingCount="{ value }">
      <span class="whitespace-nowrap">{{ value || 0 }}</span>
    </template>
    <template #value-actions="{ item }">
      <AppButton
        :icon="faTrash"
        :title="t('actions.delete')"
        variant="dangerText"
        size="sm"
        @click="handleDelete(item as GetEmailData)"
      />
    </template>
  </AppPaginatedTable>
</template>
<script lang="ts" setup>
import type { GetEmailData, Paginated } from '@beabee/beabee-common';
import { AppButton, AppButtonGroup, type Header } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { client } from '@utils/api';
import { definePaginatedQuery } from '@utils/pagination';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const headers: Header[] = [
  {
    value: 'name',
    text: t('emails.name'),
    sortable: true,
    width: '30%',
  },
  {
    value: 'subject',
    text: t('emailEditor.subject.label'),
    sortable: true,
    width: '35%',
  },
  {
    value: 'mailingCount',
    text: t('emails.mailingCount'),
    align: 'right',
    sortable: true,
    width: '20%',
  },
  {
    value: 'actions',
    text: '',
    align: 'right',
    width: '15%',
  },
];

const currentPaginatedQuery = definePaginatedQuery('date');

const emailsTable = ref<Paginated<GetEmailData>>({
  items: [],
  total: 0,
  offset: 0,
  count: 0,
});

// Load emails
watchEffect(async () => {
  emailsTable.value = await client.email.list(currentPaginatedQuery.query);
});

async function handleDelete(item: GetEmailData) {
  const confirmMessage =
    item.mailingCount && item.mailingCount > 0
      ? t('emails.confirmDelete.messageWithMailings', {
          count: item.mailingCount,
        })
      : t('emails.confirmDelete.message');

  if (confirm(`${t('emails.confirmDelete.title')}\n\n${confirmMessage}`)) {
    try {
      await client.email.delete(item.id);

      addNotification({
        variant: 'success',
        title: t('emails.notifications.deleted'),
      });

      // Reload the list
      emailsTable.value = await client.email.list(currentPaginatedQuery.query);
    } catch {
      addNotification({
        variant: 'error',
        title: t('notifications.error'),
      });
    }
  }
}
</script>
