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
      <template #value-paymentType="{}">
        {{ '-payment type placeholder-' }}
        <!-- {{ value }} -->
      </template>
      <template #value-downloadInvoice="{}">
        <AppButton
          size="xs"
          :icon="faDownload"
          variant="primaryOutlined"
          @click="downloadInvoice"
        ></AppButton>
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
import {
  type GetPaymentData,
  type GetPaymentsQuery,
  type Paginated,
  PaymentStatus,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppHeading,
  AppPagination,
  AppTable,
  type Header,
  SortType,
  formatLocale,
} from '@beabee/vue';

import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { client } from '@utils/api';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

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
  { value: 'paymentType', text: '', align: 'right' },
  { value: 'downloadInvoice', text: '', align: 'right' },
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

function downloadInvoice() {
  // TODO: Add invoice download API-endpoint
}

watchEffect(async () => {
  const query: GetPaymentsQuery = {
    offset: currentPage.value * pageSize,
    limit: pageSize,
    sort: 'chargeDate',
    order: SortType.Desc,
    rules: {
      condition: 'AND',
      rules: [
        { field: 'status', operator: 'not_equal', value: ['draft'] },
        // TODO: Enable when paymentType exists
        // { field: 'paymentType', operator: 'equal', value: ['one-time'] },
      ],
    },
  };
  paymentsHistoryTable.value = await client.contact.payment.list(
    props.id,
    query
  );
});
</script>
