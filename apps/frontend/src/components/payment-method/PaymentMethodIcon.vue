<template>
  <component :is="icons[method]" />
</template>

<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import BACS from './icons/BACS.vue';
import CreditCard from './icons/CreditCard.vue';
import DirectDebit from './icons/DirectDebit.vue';
import SEPA from './icons/SEPA.vue';
import PayPal from './icons/PayPal.vue';

defineProps<{ method: PaymentMethod }>();

const icons = {
  [PaymentMethod.StripeCard]: CreditCard,
  [PaymentMethod.StripeSEPA]: SEPA,
  [PaymentMethod.StripeBACS]: BACS,
  [PaymentMethod.StripePayPal]: PayPal,
  [PaymentMethod.GoCardlessDirectDebit]: DirectDebit,
};
</script>
