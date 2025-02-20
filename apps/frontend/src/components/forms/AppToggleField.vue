<template>
  <div class="mb-2 flex items-start justify-between gap-4">
    <div class="flex-1">
      <AppLabel v-if="label" :label="label" :required="required" />
      <p v-if="description" class="mb-0.5 mt-1 text-sm text-body-80">
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

/**
 * Props for the AppToggleField component
 */
export interface AppToggleFieldProps {
  /** Current state of the toggle */
  modelValue: boolean;
  /** Label text for the toggle field */
  label?: string;
  /** Additional descriptive text below the label */
  description?: string;
  /** Color variant of the toggle switch */
  variant?: 'primary' | 'link' | 'danger';
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
}

defineEmits<{
  /** Emitted when the toggle state changes */
  (e: 'update:modelValue', value: boolean): void;
}>();

withDefaults(defineProps<AppToggleFieldProps>(), {
  variant: 'primary',
  disabled: false,
  required: false,
  label: undefined,
  description: undefined,
});
</script>
