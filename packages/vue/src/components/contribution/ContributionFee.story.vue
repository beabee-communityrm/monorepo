<script lang="ts" setup>
import { reactive, ref } from 'vue';

import ContributionFee from './ContributionFee.vue';

const state = reactive({
  amount: 25,
  fee: 1.5,
  force: false,
  disabled: false,
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
        />
        <div class="mt-4 text-sm text-grey">
          <strong>Current value:</strong> {{ payFee }}
        </div>
      </div>
    </Variant>
  </Story>
</template>
