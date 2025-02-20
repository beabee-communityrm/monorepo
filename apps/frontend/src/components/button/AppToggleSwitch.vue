<template>
  <button
    type="button"
    class="relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-40 focus:ring-offset-2"
    :class="[
      modelValue
        ? activeVariantClasses[variant]
        : 'bg-grey-light hover:bg-grey',
      disabled && 'cursor-not-allowed opacity-50',
    ]"
    :disabled="disabled"
    :aria-checked="modelValue"
    role="switch"
    @click="toggle"
  >
    <span
      class="pointer-events-none block h-5 w-5 translate-x-0.5 transform rounded-full bg-white shadow transition-transform duration-200"
      :class="{ 'translate-x-5': modelValue }"
    />
  </button>
</template>

<script lang="ts" setup>
/**
 * A toggle switch component that provides a binary choice.
 */
const emit = defineEmits<{
  /** Emitted when the switch state changes */
  (e: 'update:modelValue', value: boolean): void;
}>();

/**
 * Props for the AppToggleSwitch component
 */
export interface AppToggleSwitchProps {
  /** Current state of the toggle switch */
  modelValue: boolean;
  /** Color variant of the switch */
  variant?: 'primary' | 'link' | 'danger';
  /** Whether the switch is disabled */
  disabled?: boolean;
}

const props = withDefaults(defineProps<AppToggleSwitchProps>(), {
  variant: 'primary',
  disabled: false,
});

const activeVariantClasses = {
  primary: 'bg-primary hover:bg-primary-110',
  link: 'bg-link hover:bg-link-110',
  danger: 'bg-danger hover:bg-danger-110',
} as const;

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
}
</script>
