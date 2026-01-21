<route lang="yaml">
name: adminPayments
meta:
  role: admin
  pageTitle: menu.payments
</route>

<template>
  <PageTitle :title="t('menu.payments')" border />

  <AppFilterGrid v-model="currentStatus" :items="statusItems">
    <div v-if="aggregation" class="mb-6 flex gap-4">
      <KeyStat
        :label="t('paymentsAdmin.aggregation.total')"
        :stat="aggregation.sum === null ? '-' : n(aggregation.sum, 'currency')"
      />
      <KeyStat
        :label="t('paymentsAdmin.aggregation.average')"
        :stat="
          aggregation.average === null
            ? '-'
            : n(aggregation.average, 'currency')
        "
      />
    </div>
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
        <PaymentStatus :status="value as PaymentStatusEnum" />
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
import type {
  GetPaymentAggregationData,
  GetPaymentDataWith,
  GetPaymentsQuery,
  Paginated,
} from '@beabee/beabee-common';
import { PaymentStatus as PaymentStatusEnum } from '@beabee/beabee-common';
import { AppFilterGrid, PageTitle, formatLocale } from '@beabee/vue';

import KeyStat from '@components/pages/admin/KeyStat.vue';
import {
  filterGroups,
  headers,
  statusItems,
} from '@components/pages/admin/payments.interface';
import { PaymentStatus } from '@components/payment';
import AppSearch from '@components/search/AppSearch.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '@utils/pagination';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      title: t('menu.dashboard'),
      to: '/admin',
      icon: faChartLine,
    },
    { title: t('menu.payments') },
  ])
);

const currentStatus = defineParam('status', (v) => v || '', 'replace');
const currentRules = defineRulesParam();
const currentPaginatedQuery = definePaginatedQuery('chargeDate');
const paymentsTable = ref<Paginated<GetPaymentDataWith<'contact'>>>();
const aggregation = ref<GetPaymentAggregationData>();

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

  paymentsTable.value = await client.payment.list(
    {
      ...currentPaginatedQuery.query,
      rules,
    },
    ['contact']
  );

  aggregation.value = await client.payment.aggregate({
    rules,
  });
});
</script>
