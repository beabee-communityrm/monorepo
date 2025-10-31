<route lang="yaml">
name: adminEmails
meta:
  role: admin
  pageTitle: menu.emails
</route>

<template>
  <PageTitle :title="t('menu.emails')" border>
    <div class="flex-0 ml-3 hidden md:block">
      <AppButton to="/admin/emails/add">{{ t('emails.addEmail') }}</AppButton>
    </div>
    <div class="fixed bottom-5 right-5 md:hidden">
      <AppButton
        :icon="faPlus"
        :title="t('emails.addEmail')"
        class="rounded-full drop-shadow-md"
        size="lg"
        to="/admin/emails/add"
      />
    </div>
  </PageTitle>
  <AppPaginatedTable
    v-model:query="currentPaginatedQuery"
    keypath="emails.showingOf"
    :headers="headers"
    :result="emailsTable"
  >
    <template #value-name="{ item, value }">
      <router-link
        :to="
          item.isSystem
            ? '/admin/emails/edit/' + item.id
            : '/admin/emails/custom/' + item.id
        "
        class="text-base font-bold text-link"
      >
        {{ value }}
      </router-link>
    </template>
    <template #value-date="{ value }">
      <span class="whitespace-nowrap">{{ formatLocale(value, 'PP') }}</span>
    </template>
    <template #value-mailingCount="{ value }">
      <span>{{ value }}</span>
    </template>
    <template #value-flags="{ item }">
      <div class="flex gap-2">
        <span
          v-if="item.isSystem"
          class="rounded bg-primary px-2 py-1 text-xs text-white"
        >
          {{ t('emails.flags.system') }}
        </span>
        <span
          v-if="item.isSegment"
          class="bg-blue-500 rounded px-2 py-1 text-xs text-white"
        >
          {{ t('emails.flags.segment') }}
        </span>
      </div>
    </template>
  </AppPaginatedTable>
</template>
<script lang="ts" setup>
import type { GetEmailListItemData, Paginated } from '@beabee/beabee-common';
import { AppButton, type Header, PageTitle, formatLocale } from '@beabee/vue';

import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import { faEnvelope, faPlus } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { definePaginatedQuery } from '@utils/pagination';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

addBreadcrumb(computed(() => [{ title: t('menu.emails'), icon: faEnvelope }]));

const headers: Header[] = [
  {
    value: 'name',
    text: t('emails.data.name'),
    sortable: true,
    width: '100%',
  },
  {
    value: 'mailingCount',
    text: t('emails.data.mailingCount'),
    align: 'right',
  },
  {
    value: 'flags',
    text: t('emails.data.flags'),
  },
  {
    value: 'date',
    text: t('emails.data.createdAt'),
    align: 'right',
    sortable: true,
  },
];

const currentPaginatedQuery = definePaginatedQuery('name');

const emailsTable = ref<Paginated<GetEmailListItemData>>();

watchEffect(async () => {
  const query = currentPaginatedQuery.query;
  emailsTable.value = await client.email.list({
    ...query,
    sort:
      query.sort === 'name' || query.sort === 'date' ? query.sort : undefined,
  });
});
</script>
