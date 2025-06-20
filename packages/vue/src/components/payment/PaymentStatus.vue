<!--
  # PaymentStatus
  Displays payment status with appropriate styling and formatting.
  
  ## Props
  - `status` (PaymentStatus): The payment status enum value
  - `statusText` (string): The translated status text to display
  
  ## Examples
  ```vue
  <PaymentStatus 
    :status="PaymentStatus.Successful" 
    status-text="Successful" 
  />
  <PaymentStatus 
    :status="PaymentStatus.Failed" 
    status-text="Failed" 
  />
  ```
-->
<template>
  <span
    class="whitespace-nowrap text-sm font-bold uppercase"
    :class="colorClasses"
    role="status"
    :aria-label="`Payment status: ${statusText}`"
  >
    {{ statusText }}
  </span>
</template>

<script lang="ts" setup>
import { PaymentStatus } from '@beabee/beabee-common';

import { computed } from 'vue';

/**
 * Props for the PaymentStatus component
 */
export interface PaymentStatusProps {
  /** The payment status enum value */
  status: PaymentStatus;
  /** The translated status text to display */
  statusText: string;
}

const props = defineProps<PaymentStatusProps>();

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
