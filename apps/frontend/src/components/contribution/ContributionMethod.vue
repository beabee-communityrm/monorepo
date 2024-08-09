<template>
  <div v-if="methods.length > 1" :class="disabled && 'opacity-50'">
    <AppSubHeading>{{ t('join.paymentMethod') }}</AppSubHeading>
    <AppChoice
      :model-value="modelValue"
      :items="
        methods.map((method) => ({
          label: t(`paymentMethods.${method}.label`),
          value: method,
        }))
      "
      @update:model-value="emit('update:modelValue', $event)"
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
import AppSubHeading from '../AppSubHeading.vue';
import AppChoice from '@components/forms/AppChoice.vue';

const { t } = useI18n();

const emit = defineEmits(['update:modelValue']);
defineProps<{
  modelValue: PaymentMethod;
  methods: PaymentMethod[];
  disabled: boolean;
}>();
</script>
