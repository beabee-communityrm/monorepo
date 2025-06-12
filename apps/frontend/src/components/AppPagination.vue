<template>
  <AppButtonGroup>
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faStepBackward"
      :disabled="isFirst"
      @click="emit('update:modelValue', 0)"
    />
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faCaretLeft"
      :disabled="isFirst"
      @click="emit('update:modelValue', modelValue - 1)"
    />
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faCaretRight"
      :disabled="isLast"
      @click="emit('update:modelValue', modelValue + 1)"
    />
    <AppButton
      type="button"
      variant="primaryOutlined"
      :icon="faStepForward"
      :disabled="isLast"
      @click="emit('update:modelValue', totalPages - 1)"
    />
  </AppButtonGroup>
</template>

<script lang="ts" setup>
import { AppButton, AppButtonGroup } from '@beabee/vue/components';

import {
  faCaretLeft,
  faCaretRight,
  faStepBackward,
  faStepForward,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  totalPages: number;
}>();

const emit = defineEmits(['update:modelValue']);

const isFirst = computed(() => props.modelValue === 0);
const isLast = computed(() => props.modelValue >= props.totalPages - 1);
</script>
