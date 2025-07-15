<!--
  # ContributionMethod
  A component for selecting payment methods.
  Displays payment methods as selectable buttons with icons and labels.

  ## Props
  - `modelValue` (PaymentMethod): The currently selected payment method
  - `methods` (PaymentMethod[]): Available payment methods to choose from
  - `disabled` (boolean): Whether the component is disabled
  - `title` (string): Title text for the payment method selection

  ## Events
  - `update:modelValue` (PaymentMethod): Emitted when the selected method changes

  ## Features
  - Visual selection with icons and labels
  - Responsive grid layout
  - Keyboard navigation support
  - Accessibility with proper ARIA attributes
-->
<template>
  <div v-if="methods.length > 1" :class="disabled && 'opacity-50'">
    <AppSubHeading>{{ title }}</AppSubHeading>
    <div
      class="grid gap-2"
      :class="methods.length > 2 ? 'grid-cols-3' : 'grid-cols-2'"
    >
      <div v-for="method in methods" :key="method">
        <button
          class="h-full min-h-[2.5rem] w-full rounded border border-primary-40 p-1.5 text-left text-lg font-semibold enabled:cursor-pointer"
          :class="
            disabled
              ? ''
              : method === modelValue
                ? '!border-link-110 bg-link text-white'
                : 'bg-white hover:border-link hover:bg-link-10'
          "
          type="button"
          :disabled="disabled"
          :aria-pressed="method === modelValue"
          :aria-label="`Select ${methodLabels[method]} payment method`"
          @click="emit('update:modelValue', method)"
        >
          <PaymentMethodIcon :method="method" /><span
            class="text-xs"
            :class="methods.length > 2 ? 'block' : 'm-2 inline'"
          >
            {{ methodLabels[method] }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import { AppSubHeading } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { PaymentMethodIcon } from '../payment';

const { t } = useI18n();

/**
 * Props for the ContributionMethod component
 */
export interface ContributionMethodProps {
  /** The currently selected payment method */
  modelValue: PaymentMethod;
  /** Available payment methods to choose from */
  methods: PaymentMethod[];
  /** Whether the component is disabled */
  disabled: boolean;
  /** Title text for the payment method selection */
  title: string;
}

const emit = defineEmits(['update:modelValue']);
defineProps<ContributionMethodProps>();

/**
 * Internal payment method labels using vue-i18n
 */
const methodLabels = computed(() => ({
  [PaymentMethod.StripeCard]: t('paymentMethods.s_card.label'),
  [PaymentMethod.StripeSEPA]: t('paymentMethods.s_sepa.label'),
  [PaymentMethod.StripeBACS]: t('paymentMethods.s_bacs.label'),
  [PaymentMethod.StripePayPal]: t('paymentMethods.s_paypal.label'),
  [PaymentMethod.StripeIdeal]: t('paymentMethods.s_ideal.label'),
  [PaymentMethod.GoCardlessDirectDebit]: t(
    'paymentMethods.gc_direct-debit.label'
  ),
}));
</script>
