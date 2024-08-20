<template>
  <div>
    <template v-if="showPaymentMethod && methods.length">
      <AppLabel :label="t('join.paymentMethod')" required />

      <AppChoice
        v-model="paymentMethod"
        :items="methods.map((method) => ({ value: method }))"
        class="mb-4"
      >
        <template #default="{ item }">
          <PaymentMethodIcon :method="item.value" /><span
            class="text-xs"
            :class="methods.length > 2 ? 'block' : 'm-2 inline'"
            >{{ t(`paymentMethods.${item.value}.label`) }}</span
          >
        </template>
      </AppChoice>
    </template>

    <template v-if="showAbsorbFee">
      <p class="mb-2 text-sm leading-normal">
        {{ t('join.absorbFeeText', { fee: n(fee, 'currency') }) }}
      </p>

      <AppCheckbox
        v-model="payFee"
        :disabled="forceFee"
        :label="
          t(forceFee ? 'join.absorbFeeForce' : 'join.absorbFeeOptIn', {
            fee: n(fee, 'currency'),
            amount: n(data.amount, 'currency'),
          })
        "
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import {
  calcPaymentFee,
  ContributionPeriod,
  PaymentMethod,
  type StripeFeeCountry,
} from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import PaymentMethodIcon from '../payment-method/PaymentMethodIcon.vue';
import AppChoice from '@components/forms/AppChoice.vue';
import AppLabel from '@components/forms/AppLabel.vue';
import { computed, watchEffect } from 'vue';
import AppCheckbox from '@components/forms/AppCheckbox.vue';

const { n, t } = useI18n();

const props = defineProps<{
  content: { showAbsorbFee: boolean; stripeCountry: StripeFeeCountry };
  data: { period: ContributionPeriod; amount: number };
  methods: PaymentMethod[];
  showPaymentMethod: boolean;
}>();

const paymentMethod = defineModel<PaymentMethod>('paymentMethod', {
  required: true,
});
const payFee = defineModel<boolean>('payFee', { required: true });

const fee = computed(() =>
  calcPaymentFee(
    { ...props.data, paymentMethod: paymentMethod.value },
    props.content.stripeCountry
  )
);

const showAbsorbFee = computed(
  () =>
    props.content.showAbsorbFee &&
    props.data.period === ContributionPeriod.Monthly
);

const forceFee = computed(() => showAbsorbFee.value && props.data.amount === 1);
watchEffect(() => {
  if (forceFee.value) payFee.value = true;
});
</script>
