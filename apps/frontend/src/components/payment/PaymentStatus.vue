<!--
  # PaymentStatus
  Displays payment status with appropriate styling and formatting.
    
  ## Props
  - `status` (PaymentStatus): The payment status enum value
  
  ## Examples
  ```vue
  <PaymentStatus :status="PaymentStatus.Successful" />
  <PaymentStatus :status="PaymentStatus.Failed" />
  ```
-->
<template>
  <span
    class="whitespace-nowrap text-sm font-bold uppercase"
    :class="colorMap[status]"
    role="status"
    :aria-label="ariaLabel"
  >
    {{ statusText }}
  </span>
</template>

<script lang="ts" setup>
import { PaymentStatus } from '@beabee/beabee-common';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const colorMap = {
  [PaymentStatus.Draft]: 'text-body-60',
  [PaymentStatus.Pending]: 'text-body-60',
  [PaymentStatus.Successful]: 'text-success',
  [PaymentStatus.Cancelled]: 'text-danger',
  [PaymentStatus.Failed]: 'text-danger',
};

/**
 * Props for the PaymentStatus component
 */
export interface PaymentStatusProps {
  /** The payment status enum value */
  status: PaymentStatus;
}

const props = defineProps<PaymentStatusProps>();

/**
 * Internal status text using vue-i18n
 */
const statusText = computed(() => {
  return t(`common.paymentStatus.${props.status}`);
});

/**
 * Accessible aria-label for payment status
 */
const ariaLabel = computed(() => {
  return t('common.statusLabel', { status: statusText.value });
});
</script>
