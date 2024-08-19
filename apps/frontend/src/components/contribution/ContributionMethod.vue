<template>
  <div v-if="methods.length > 1" class="mb-8" :class="disabled && 'opacity-50'">
    <AppLabel :label="t('join.paymentMethod')" required />
    <AppChoice
      v-model="paymentMethod"
      :items="methods.map((method) => ({ value: method }))"
    >
      <template #default="{ item }">
        <PaymentMethodIcon :method="item.value" /><span
          class="text-xs"
          :class="methods.length > 2 ? 'block' : 'm-2 inline'"
          >{{ t(`paymentMethods.${item.value}.label`) }}</span
        >
      </template>
    </AppChoice>
  </div>
</template>
<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import PaymentMethodIcon from '../payment-method/PaymentMethodIcon.vue';
import AppChoice from '@components/forms/AppChoice.vue';
import AppLabel from '@components/forms/AppLabel.vue';

const { t } = useI18n();

defineProps<{
  methods: PaymentMethod[];
  disabled?: boolean;
}>();

const paymentMethod = defineModel<PaymentMethod>({ required: true });
</script>
