<route lang="yaml">
name: adminPayments
meta:
  role: admin
  pageTitle: menu.payments
</route>

<template>
  <PageTitle :title="t('menu.payments')" border />

  <AppFilterGrid v-model="currentStatus" :items="statusItems">
    <AppSearch
      v-model="currentRules"
      :filter-groups="filterGroups"
      @reset="currentRules = undefined"
    />
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      keypath="paymentsAdmin.showingOf"
      :headers="headers"
      :result="paymentsTable"
    >
      <template #value-status="{ value }">
        <PaymentStatus :status="value" />
      </template>
      <template #value-contact="{ value }">
        <router-link
          :to="'/admin/contacts/' + value.id"
          class="text-base font-bold text-link"
        >
          {{ value.displayName }}
        </router-link>
      </template>
      <template #value-chargeDate="{ value }">
        <span class="whitespace-nowrap">{{ formatLocale(value, 'PP') }}</span>
      </template>
      <template #value-amount="{ value }">
        {{ n(value, 'currency') }}
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import type { Paginated } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import { computed, ref, watchEffect } from 'vue';
import { faEuro } from '@fortawesome/free-solid-svg-icons';

import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '@utils/pagination';
import { fetchPayments } from '@utils/api/payment';
import { formatLocale } from '@utils/dates';

import PageTitle from '@components/PageTitle.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import PaymentStatus from '@components/payment/PaymentStatus.vue';
import AppSearch from '@components/search/AppSearch.vue';
import {
  headers,
  statusItems,
  filterGroups,
} from '@components/pages/admin/payments.interface';
import AppFilterGrid from '@components/AppFilterGrid.vue';

import { addBreadcrumb } from '@store/breadcrumb';

import type { GetPaymentDataWith, GetPaymentsQuery } from '@type';

const { t, n } = useI18n();

addBreadcrumb(computed(() => [{ title: t('menu.payments'), icon: faEuro }]));

const currentStatus = defineParam('status', (v) => v || '', 'replace');
const currentRules = defineRulesParam();
const currentPaginatedQuery = definePaginatedQuery('chargeDate');
const paymentsTable = ref<Paginated<GetPaymentDataWith<'contact'>>>();

watchEffect(async () => {
  const rules: GetPaymentsQuery['rules'] = { condition: 'AND', rules: [] };

  if (currentStatus.value) {
    rules.rules.push({
      field: 'status',
      operator: 'equal' as const,
      value: [currentStatus.value],
    });
  }

  if (currentRules.value) {
    rules.rules.push(currentRules.value);
  }

  paymentsTable.value = await fetchPayments(
    {
      ...currentPaginatedQuery.query,
      rules,
    },
    ['contact']
  );
});
</script>
