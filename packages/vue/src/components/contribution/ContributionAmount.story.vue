<script lang="ts" setup>
import { reactive, ref } from 'vue';

import ContributionAmount from './ContributionAmount.vue';

const state = reactive({
  amount: 25,
  isMonthly: true,
  minAmount: 5,
  definedAmounts: [5, 10, 25, 50],
  disabled: false,
  currencySymbol: '€',
});

const amount = ref(25);
const amountYearly = ref(300);
</script>

<template>
  <Story title="Contribution/ContributionAmount">
    <Variant title="Playground">
      <div class="max-w-md">
        <ContributionAmount
          v-model="amount"
          :is-monthly="state.isMonthly"
          :min-amount="state.minAmount"
          :defined-amounts="state.definedAmounts"
          :disabled="state.disabled"
          :currency-symbol="state.currencySymbol"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ amount }}
        </div>
      </div>

      <template #controls>
        <HstNumber v-model="state.amount" title="Amount" />
        <HstCheckbox v-model="state.isMonthly" title="Is Monthly" />
        <HstNumber v-model="state.minAmount" title="Min Amount" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstText v-model="state.currencySymbol" title="Currency Symbol" />
      </template>
    </Variant>

    <Variant title="Monthly Contribution">
      <div class="max-w-md">
        <ContributionAmount
          v-model="amount"
          :is-monthly="true"
          :min-amount="5"
          :defined-amounts="[5, 10, 25, 50]"
          :disabled="false"
          currency-symbol="€"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected amount:</strong> €{{ amount }} per month
        </div>
      </div>
    </Variant>

    <Variant title="Yearly Contribution">
      <div class="max-w-md">
        <ContributionAmount
          v-model="amountYearly"
          :is-monthly="false"
          :min-amount="60"
          :defined-amounts="[60, 120, 300, 600]"
          :disabled="false"
          currency-symbol="€"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected amount:</strong> €{{ amountYearly }} per year
        </div>
      </div>
    </Variant>

    <Variant title="Different Currency">
      <div class="max-w-md">
        <ContributionAmount
          v-model="amount"
          :is-monthly="true"
          :min-amount="5"
          :defined-amounts="[5, 15, 30, 60]"
          :disabled="false"
          currency-symbol="$"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected amount:</strong> ${{ amount }} per month
        </div>
      </div>
    </Variant>

    <Variant title="Disabled State">
      <div class="max-w-md">
        <ContributionAmount
          v-model="amount"
          :is-monthly="true"
          :min-amount="5"
          :defined-amounts="[5, 10, 25, 50]"
          :disabled="true"
          currency-symbol="€"
        />
      </div>
    </Variant>

    <Variant title="Large Amounts">
      <div class="max-w-md">
        <ContributionAmount
          v-model="amount"
          :is-monthly="true"
          :min-amount="100"
          :defined-amounts="[100, 250, 500, 1000]"
          :disabled="false"
          currency-symbol="€"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Selected amount:</strong> €{{ amount.toLocaleString() }} per
          month
        </div>
      </div>
    </Variant>
  </Story>
</template>
