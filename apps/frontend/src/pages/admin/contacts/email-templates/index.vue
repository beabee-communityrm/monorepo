<route lang="yaml">
name: adminContactsEmailTemplates
meta:
  pageTitle: contacts.emailTemplates.title
  role: admin
</route>

<template>
  <PageTitle :title="t('contacts.emailTemplates.title')" border />

  <AppPaginatedTable
    v-model:query="currentPaginatedQuery"
    keypath="contacts.emailTemplates.showingOf"
    :headers="headers"
    :result="emailTable"
    class="mb-8"
  >
    <template #value-name="{ item, value }">
      <router-link
        :to="{
          name: 'adminContactsEmailTemplatesEdit',
          params: { emailId: item.id },
        }"
        class="text-base font-bold text-link"
      >
        {{ value }}
      </router-link>
    </template>
    <template #value-subject="{ value }">
      <span class="line-clamp-2 max-w-md" :title="value">{{ value }}</span>
    </template>
    <template #value-date="{ value }">
      <span class="whitespace-nowrap">{{ formatLocale(value, 'PP') }}</span>
    </template>
    <template #value-mailingCount="{ value }">
      {{ value ?? 0 }}
    </template>
    <template #empty>
      <p>{{ t('contacts.emailTemplates.empty') }}</p>
    </template>
  </AppPaginatedTable>
</template>

<script lang="ts" setup>
import type { GetEmailData, Paginated } from '@beabee/beabee-common';
import { type Header, PageTitle, formatLocale } from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import AppPaginatedTable from '#components/table/AppPaginatedTable.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { definePaginatedQuery } from '#utils/pagination';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
    { title: t('contacts.emailTemplates.title') },
  ])
);

const headers = computed<Header[]>(() => [
  {
    value: 'name',
    text: t('contacts.emailTemplates.name'),
    sortable: true,
    width: '20%',
  },
  {
    value: 'subject',
    text: t('contacts.emailTemplates.subject'),
    sortable: true,
  },
  {
    value: 'date',
    text: t('contacts.emailTemplates.date'),
    align: 'right',
    sortable: true,
  },
  {
    value: 'mailingCount',
    text: t('emails.mailingCount'),
    align: 'right',
  },
]);

const emailTable = ref<Paginated<GetEmailData>>();
const currentPaginatedQuery = definePaginatedQuery('date');

async function refreshEmails() {
  emailTable.value = await client.email.list(currentPaginatedQuery.query);
}

watchEffect(refreshEmails);
</script>
