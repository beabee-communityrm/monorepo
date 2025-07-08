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
    :class="colorClasses"
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
  return t('payment.statusLabel', { status: statusText.value });
});

/**
 * Computed color classes based on payment status
 */
const colorClasses = computed(() => {
  const colorMap = {
    [PaymentStatus.Draft]: 'text-body-60',
    [PaymentStatus.Pending]: 'text-body-60',
    [PaymentStatus.Successful]: 'text-success',
    [PaymentStatus.Cancelled]: 'text-danger',
    [PaymentStatus.Failed]: 'text-danger',
  };

  return colorMap[props.status] || 'text-body-60';
});
</script>
