<script lang="ts" setup>
import { reactive, ref } from 'vue';

import ContributionFee from './ContributionFee.vue';

const state = reactive({
  amount: 25,
  fee: 1.5,
  force: false,
  disabled: false,
  absorbFeeText: 'Help us cover the €1.50 processing fee for this transaction.',
  absorbFeeLabel: "I'll pay €1.50 to cover the processing fee (€26.50 total)",
});

const payFee = ref(false);
const payFeeForced = ref(true);
const payFeeDisabled = ref(false);
</script>

<template>
  <Story title="Contribution/ContributionFee">
    <Variant title="Playground">
      <div class="max-w-md">
        <ContributionFee
          v-model="payFee"
          :amount="state.amount"
          :fee="state.fee"
          :force="state.force"
          :disabled="state.disabled"
          :absorb-fee-text="state.absorbFeeText"
          :absorb-fee-label="state.absorbFeeLabel"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFee }}
        </div>
      </div>

      <template #controls>
        <HstNumber v-model="state.amount" title="Amount" />
        <HstNumber v-model="state.fee" title="Fee" :step="0.1" />
        <HstCheckbox v-model="state.force" title="Force Fee" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstText v-model="state.absorbFeeText" title="Absorb Fee Text" />
        <HstText v-model="state.absorbFeeLabel" title="Absorb Fee Label" />
      </template>
    </Variant>

    <Variant title="Basic Usage">
      <div class="max-w-md">
        <ContributionFee
          v-model="payFee"
          :amount="25"
          :fee="1.5"
          :force="false"
          :disabled="false"
          absorb-fee-text="Help us cover the €1.50 processing fee for this transaction."
          absorb-fee-label="I'll pay €1.50 to cover the processing fee (€26.50 total)"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFee }}
        </div>
      </div>
    </Variant>

    <Variant title="Forced Fee (Minimum Contribution)">
      <div class="max-w-md">
        <ContributionFee
          v-model="payFeeForced"
          :amount="1"
          :fee="0.5"
          :force="true"
          :disabled="false"
          absorb-fee-text="For minimum contributions, the processing fee must be absorbed."
          absorb-fee-label="Processing fee of €0.50 is required for this contribution amount"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFeeForced }}
        </div>
      </div>
    </Variant>

    <Variant title="Disabled State">
      <div class="max-w-md">
        <ContributionFee
          v-model="payFeeDisabled"
          :amount="25"
          :fee="1.5"
          :force="false"
          :disabled="true"
          absorb-fee-text="Fee absorption is not available for this payment method."
          absorb-fee-label="Processing fee option unavailable"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFeeDisabled }}
        </div>
      </div>
    </Variant>

    <Variant title="Large Fee Example">
      <div class="max-w-md">
        <ContributionFee
          v-model="payFee"
          :amount="100"
          :fee="3.25"
          :force="false"
          :disabled="false"
          absorb-fee-text="Help us cover the €3.25 processing fee for this €100 contribution."
          absorb-fee-label="I'll pay €3.25 to cover the processing fee (€103.25 total)"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFee }}
        </div>
      </div>
    </Variant>

    <Variant title="Long Text Example">
      <div class="max-w-md">
        <ContributionFee
          v-model="payFee"
          :amount="50"
          :fee="2.15"
          :force="false"
          :disabled="false"
          absorb-fee-text="By covering the processing fee, you ensure that 100% of your contribution goes directly to supporting our mission. This small additional amount helps us minimize operational costs."
          absorb-fee-label="Yes, I'll cover the €2.15 processing fee so my full €50 contribution supports your work (€52.15 total)"
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFee }}
        </div>
      </div>
    </Variant>
  </Story>
</template>
