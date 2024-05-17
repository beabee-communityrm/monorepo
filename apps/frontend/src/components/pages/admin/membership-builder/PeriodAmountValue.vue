<template>
  <div class="mb-2 max-w-[8rem]">
    <AppInput
      v-model="amount"
      type="number"
      :min="minAmount"
      :prefix="generalContent.currencySymbol"
      required
      class="block"
    />
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import AppInput from '../../../forms/AppInput.vue';
import { generalContent } from '../../../../store';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: number;
  minAmount: number;
}>();

const amount = computed({
  get: () => props.modelValue,
  set: (newAmount) => emit('update:modelValue', newAmount),
});
</script>
