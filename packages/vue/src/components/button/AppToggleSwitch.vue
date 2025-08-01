<!--
  # AppToggleSwitch
  A toggle switch component for binary choices with multiple color variants and sizes.
  Provides visual feedback for on/off states with smooth animations.
-->
<template>
  <button
    type="button"
    class="relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-40 focus:ring-offset-2"
    :class="[
      modelValue
        ? activeVariantClasses[variant]
        : 'bg-grey-light hover:bg-grey',
      disabled && 'cursor-not-allowed opacity-50',
      sizeClasses[size],
    ]"
    :disabled="disabled"
    :aria-checked="modelValue"
    role="switch"
    @click="toggle"
  >
    <span
      class="pointer-events-none block bg-white shadow transition-transform duration-200"
      :class="[
        switchSizeClasses[size],
        modelValue ? translateClasses[size] : 'translate-x-0.5',
      ]"
    />
  </button>
</template>

<script lang="ts" setup>
/**
 * Toggle switch component for binary choices with variant support.
 * Provides a visual alternative to checkboxes for on/off states with smooth animations.
 *
 * @component AppToggleSwitch
 *
 * @example
 * <AppToggleSwitch v-model="enabled" variant="primary" />
 */

/**
 * Props for the AppToggleSwitch component
 */
export interface AppToggleSwitchProps {
  /** Current state of the toggle switch */
  modelValue: boolean;
  /** Color variant affecting the active state styling */
  variant?: 'primary' | 'link' | 'danger';
  /** Size variant affecting dimensions */
  size?: 'default' | 'small';
  /** Whether the switch is disabled */
  disabled?: boolean;
}

/**
 * Events emitted by the AppToggleSwitch component
 */
const emit = defineEmits<{
  /**
   * Emitted when the switch state changes
   * @param value - The new boolean value
   */
  (e: 'update:modelValue', value: boolean): void;
}>();

const props = withDefaults(defineProps<AppToggleSwitchProps>(), {
  variant: 'primary',
  size: 'default',
  disabled: false,
});

const activeVariantClasses = {
  primary: 'bg-primary hover:bg-primary-110',
  link: 'bg-link hover:bg-link-110',
  danger: 'bg-danger hover:bg-danger-110',
} as const;

const sizeClasses = {
  default: 'h-6 w-11 rounded-full',
  small: 'h-5 w-9 rounded-full',
} as const;

const switchSizeClasses = {
  default: 'h-5 w-5 rounded-full',
  small: 'h-4 w-4 rounded-full',
} as const;

const translateClasses = {
  default: 'translate-x-5',
  small: 'translate-x-4',
} as const;

/**
 * Toggles the switch state if not disabled
 */
function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
}
</script>
