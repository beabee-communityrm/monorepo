<template>
  <div v-if="methods.length > 1" :class="disabled && 'opacity-50'">
    <AppSubHeading>{{ t('join.paymentMethod') }}</AppSubHeading>
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
          @click="emit('update:modelValue', method)"
        >
          <PaymentMethodIcon :method="method" /><span
            class="text-xs"
            :class="methods.length > 2 ? 'block' : 'm-2 inline'"
            >{{ t(`paymentMethods.${method}.label`) }}</span
          >
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
import PaymentMethodIcon from '../payment-method/PaymentMethodIcon.vue';
import AppSubHeading from '../AppSubHeading.vue';

const { t } = useI18n();

const emit = defineEmits(['update:modelValue']);
defineProps<{
  modelValue: PaymentMethod;
  methods: PaymentMethod[];
  disabled: boolean;
}>();
</script>
