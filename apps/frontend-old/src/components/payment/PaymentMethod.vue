<!--
  # PaymentMethod
  Displays payment method information with icon and formatted description.
  Shows appropriate details based on the payment method type.
  
  ## Props
  - `source` (PaymentSource): The payment source containing method and details
  
  ## Examples
  ```vue
  <PaymentMethod :source="paymentSource" />
  ```
-->
<template>
  <div
    v-if="source.method"
    role="group"
    :aria-label="`Payment method: ${description}`"
  >
    <PaymentMethodIcon :method="source.method" aria-hidden="true" />
    {{ description }}
  </div>
</template>

<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import type { PaymentSource } from '@beabee/beabee-common';

import { computed } from 'vue';

import PaymentMethodIcon from './PaymentMethodIcon.vue';

/**
 * Props for the PaymentMethod component
 */
export interface PaymentMethodProps {
  /** The payment source containing method and details */
  source: PaymentSource;
}

const props = defineProps<PaymentMethodProps>();

/**
 * Computed description based on payment method type
 */
const description = computed(() => {
  const source = props.source;

  switch (source.method) {
    case PaymentMethod.StripeCard:
      return source.isLink
        ? source.email
        : `•••• •••• •••• ${source.last4}, ${String(
            source.expiryMonth
          ).padStart(2, '0')}/${source.expiryYear}`;
    case PaymentMethod.StripeBACS:
      return `${source.sortCode} ••••••••••${source.last4}`;
    case PaymentMethod.StripeSEPA:
      return `${source.country}••${source.bankCode}${source.branchCode}••••${source.last4}`;
    case PaymentMethod.GoCardlessDirectDebit:
      return `${source.accountHolderName}, ${source.bankName}, ••••••••••${source.accountNumberEnding}`;
    case PaymentMethod.StripePayPal:
      return `${source.payerEmail}`;
    default:
      return '';
  }
});
</script>
