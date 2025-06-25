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
      getToggleSwitchVariantClasses(variant, modelValue),
      disabled && 'cursor-not-allowed opacity-50',
      getToggleSwitchSizeClasses(size, 'container'),
    ]"
    :disabled="disabled"
    :aria-checked="modelValue"
    role="switch"
    @click="toggle"
  >
    <span
      class="pointer-events-none block bg-white shadow transition-transform duration-200"
      :class="[
        getToggleSwitchSizeClasses(size, 'switch'),
        modelValue
          ? getToggleSwitchSizeClasses(size, 'translate')
          : 'translate-x-0.5',
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
import type { AppToggleSwitchProps } from '../../types/button';
import {
  getToggleSwitchSizeClasses,
  getToggleSwitchVariantClasses,
} from '../../utils/variants';

// Props interface is now imported from types
export type { AppToggleSwitchProps } from '../../types/button';

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

// Variant and size classes are now provided by utility functions

/**
 * Toggles the switch state if not disabled
 */
function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
}
</script>
