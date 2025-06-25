<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';

import { reactive, ref } from 'vue';

import ContributionMethod from './ContributionMethod.vue';

const state = reactive({
  methods: [PaymentMethod.StripeCard, PaymentMethod.StripePayPal],
  disabled: false,
  title: 'Payment Method',
  methodLabels: {
    [PaymentMethod.StripeCard]: 'Credit Card',
    [PaymentMethod.StripeSEPA]: 'SEPA',
    [PaymentMethod.StripeBACS]: 'BACS',
    [PaymentMethod.StripePayPal]: 'PayPal',
    [PaymentMethod.StripeIdeal]: 'iDEAL',
    [PaymentMethod.GoCardlessDirectDebit]: 'Direct Debit',
  },
});

const selectedMethod = ref(PaymentMethod.StripeCard);
const selectedMethodThree = ref(PaymentMethod.StripeCard);
const selectedMethodAll = ref(PaymentMethod.StripeCard);
</script>

<template>
  <Story title="Contribution/ContributionMethod">
    <Variant title="Playground">
      <div class="max-w-md">
        <ContributionMethod
          v-model="selectedMethod"
          :methods="state.methods"
          :disabled="state.disabled"
          :title="state.title"
          :method-labels="state.methodLabels"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected method:</strong> {{ selectedMethod }}
        </div>
      </div>

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstText v-model="state.title" title="Title" />
      </template>
    </Variant>

    <Variant title="Two Methods">
      <div class="max-w-md">
        <ContributionMethod
          v-model="selectedMethod"
          :methods="[PaymentMethod.StripeCard, PaymentMethod.StripePayPal]"
          :disabled="false"
          title="Choose Payment Method"
          :method-labels="state.methodLabels"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected:</strong> {{ state.methodLabels[selectedMethod] }}
        </div>
      </div>
    </Variant>

    <Variant title="Three Methods">
      <div class="max-w-md">
        <ContributionMethod
          v-model="selectedMethodThree"
          :methods="[
            PaymentMethod.StripeCard,
            PaymentMethod.StripePayPal,
            PaymentMethod.StripeSEPA,
          ]"
          :disabled="false"
          title="Payment Method"
          :method-labels="state.methodLabels"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected:</strong>
          {{ state.methodLabels[selectedMethodThree] }}
        </div>
      </div>
    </Variant>

    <Variant title="All Payment Methods">
      <div class="max-w-md">
        <ContributionMethod
          v-model="selectedMethodAll"
          :methods="[
            PaymentMethod.StripeCard,
            PaymentMethod.StripePayPal,
            PaymentMethod.StripeSEPA,
            PaymentMethod.StripeBACS,
            PaymentMethod.StripeIdeal,
            PaymentMethod.GoCardlessDirectDebit,
          ]"
          :disabled="false"
          title="Select Payment Method"
          :method-labels="state.methodLabels"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected:</strong> {{ state.methodLabels[selectedMethodAll] }}
        </div>
      </div>
    </Variant>

    <Variant title="Disabled State">
      <div class="max-w-md">
        <ContributionMethod
          v-model="selectedMethod"
          :methods="[PaymentMethod.StripeCard, PaymentMethod.StripePayPal]"
          :disabled="true"
          title="Payment Method (Disabled)"
          :method-labels="state.methodLabels"
        />
      </div>
    </Variant>

    <Variant title="Single Method (Hidden)">
      <div class="max-w-md">
        <ContributionMethod
          v-model="selectedMethod"
          :methods="[PaymentMethod.StripeCard]"
          :disabled="false"
          title="Payment Method"
          :method-labels="state.methodLabels"
        />
        <p class="mt-4 text-sm text-grey">
          Component is hidden when only one method is available
        </p>
      </div>
    </Variant>
  </Story>
</template>
