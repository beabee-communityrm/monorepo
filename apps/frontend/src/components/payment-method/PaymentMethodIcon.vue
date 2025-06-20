<template>
  <VuePaymentMethodIcon :method="method" />
</template>

<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import { PaymentMethodIcon as VuePaymentMethodIcon } from '@beabee/vue';

defineProps<{ method: PaymentMethod }>();
</script>
