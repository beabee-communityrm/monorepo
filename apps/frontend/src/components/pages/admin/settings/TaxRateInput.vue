<template>
  <div class="mb-4">
    <AppCheckbox v-model="enabled" :label="label" class="font-bold" />
  </div>
  <div v-if="enabled" class="mb-4 max-w-[8rem] whitespace-nowrap">
    <AppInput
      v-model="taxRate"
      type="number"
      :label="t('adminSettings.payment.taxRate')"
      :min="0"
      :max="100"
      suffix="%"
      required
    />
  </div>
</template>

<script lang="ts" setup>
import { AppCheckbox, AppInput } from '@beabee/vue';

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();
const props = defineProps<{
  label: string;
  modelValue: number | null;
}>();

const { t } = useI18n();

const enabled = ref(props.modelValue !== null);
const taxRate = ref(props.modelValue || 0);

watch([enabled, taxRate], () => {
  emit('update:modelValue', enabled.value ? taxRate.value : null);
});
</script>
