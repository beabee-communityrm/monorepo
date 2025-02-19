<template>
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1">
      <AppLabel v-if="label" :label="label" :required="required" />
      <p v-if="description" class="mt-1 text-sm text-body-80">
        {{ description }}
      </p>
    </div>
    <AppToggleSwitch
      :model-value="modelValue"
      :variant="variant"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import AppLabel from './AppLabel.vue';
import AppToggleSwitch from '../button/AppToggleSwitch.vue';

interface Props {
  modelValue: boolean;
  label?: string;
  description?: string;
  variant?: 'primary' | 'link' | 'danger';
  disabled?: boolean;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  required: false,
  label: undefined,
  description: undefined,
});

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>
