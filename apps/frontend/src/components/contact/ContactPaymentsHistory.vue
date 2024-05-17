<template>
  <div v-if="paymentsHistoryTable.total > 0">
    <AppHeading>{{ t('contribution.paymentHistory.title') }}</AppHeading>
    <AppTable
      :sort="{ by: 'chargeDate', type: SortType.Desc }"
      :headers="headers"
      :items="paymentsHistoryTable.items"
      :row-class="getRowClass"
      hide-headers
      class="w-full"
    >
      <template #value-chargeDate="{ value }">
        {{ formatLocale(value, 'PPP') }}
      </template>
      <template #value-amount="{ value, item }">
        <span v-if="item.status !== PaymentStatus.Successful" class="mr-3">
          {{ t('common.paymentStatus.' + item.status) }}
        </span>
        <b>{{ n(value, 'currency') }}</b>
      </template>
    </AppTable>
    <div v-if="totalPages > 1" class="mt-6 flex w-full justify-between gap-2">
      <p class="self-center text-sm">
        <i18n-t keypath="common.pageCount">
          <template #pageNumber
            ><b>{{ n(currentPage + 1) }}</b></template
          >
          <template #pageTotal
            ><b>{{ n(totalPages) }}</b></template
          >
        </i18n-t>
      </p>
      <AppPagination v-model="currentPage" :total-pages="totalPages" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type Paginated, PaymentStatus } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import { computed, ref, watchEffect } from 'vue';

import AppTable from '@components/table/AppTable.vue';
import AppPagination from '@components/AppPagination.vue';
import { type Header, SortType } from '@components/table/table.interface';
import AppHeading from '@components/AppHeading.vue';

import { formatLocale } from '@utils/dates';
import { fetchPayments } from '@utils/api/contact';

import type { GetPaymentData, GetPaymentsQuery } from '@type';

const { t, n } = useI18n();

const props = defineProps<{
  id: string;
}>();

const paymentsHistoryTable = ref<Paginated<GetPaymentData>>({
  items: [],
  offset: 0,
  count: 0,
  total: 0,
});
const pageSize = 12;
const currentPage = ref(0);
const totalPages = computed(() =>
  Math.ceil(paymentsHistoryTable.value.total / pageSize)
);

const headers: Header[] = [
  { value: 'chargeDate', text: '' },
  { value: 'amount', text: '', align: 'right' },
];

function getRowClass(item: GetPaymentData) {
  switch (item.status) {
    case PaymentStatus.Cancelled:
    case PaymentStatus.Failed:
      return 'text-danger';
    case PaymentStatus.Pending:
    case PaymentStatus.Draft:
      return 'text-body-60';
    default:
      return '';
  }
}

watchEffect(async () => {
  const query: GetPaymentsQuery = {
    offset: currentPage.value * pageSize,
    limit: pageSize,
    sort: 'chargeDate',
    order: SortType.Desc,
    rules: {
      condition: 'AND',
      rules: [{ field: 'status', operator: 'not_equal', value: ['draft'] }],
    },
  };
  paymentsHistoryTable.value = await fetchPayments(props.id, query);
});
</script>
