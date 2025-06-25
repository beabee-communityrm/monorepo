<template>
  <a
    v-if="href"
    :href="!disabled ? href : undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="buttonClasses"
    :title="title || name"
    :aria-label="name || title"
    :aria-disabled="disabled"
    role="button"
  >
    <font-awesome-icon
      v-if="icon"
      :icon="icon"
      aria-hidden="true"
      class="pointer-events-none"
    /><slot />
  </a>
  <router-link
    v-else-if="to"
    :to="to"
    :class="buttonClasses"
    :title="title || name"
    :aria-label="name || title"
    :aria-disabled="disabled"
    role="button"
  >
    <font-awesome-icon
      v-if="icon"
      :icon="icon"
      aria-hidden="true"
      class="pointer-events-none"
    /><slot />
  </router-link>

  <component
    :is="is"
    v-else
    ref="innerButton"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :type="type"
    :title="title || name"
    :aria-label="name || title"
    :aria-busy="loading"
    :aria-disabled="disabled"
  >
    <font-awesome-icon
      v-if="icon"
      :icon="icon"
      aria-hidden="true"
      class="pointer-events-none"
    /><slot />
    <span
      v-if="loading"
      class="absolute inset-0 bg-white opacity-30"
      aria-hidden="true"
    />
    <font-awesome-icon
      v-if="loading"
      class="absolute text-2xl"
      :class="loadingIconClasses"
      :icon="faCircleNotch"
      spin
      aria-hidden="true"
    />
    <slot name="after" />
  </component>
</template>

<script lang="ts" setup>
/**
 * A versatile button component that can render as button, anchor, or router-link.
 * Supports multiple visual variants, sizes, icons, loading states, and disabled state.
 *
 * @component AppButton
 *
 * @example
 * // Basic button
 * <AppButton>Click me</AppButton>
 *
 * // With variant and icon
 * <AppButton variant="primary" :icon="faUser">User Profile</AppButton>
 *
 * // As external link
 * <AppButton href="https://example.com" external>Visit Site</AppButton>
 *
 * // As router link
 * <AppButton :to="{ name: 'home' }">Go Home</AppButton>
 *
 * @props {boolean} [disabled=false] - Disables the button
 * @props {boolean} [loading=false] - Shows a loading spinner
 * @props {('button'|'submit')} [type='button'] - HTML button type
 * @props {string} [href] - URL for anchor tag
 * @props {boolean} [external=false] - Opens link in new tab if true
 * @props {RouteLocationRaw} [to] - Vue Router destination
 * @props {string} [variant='primary'] - Button style variant
 * @props {('xs'|'sm'|'md'|'lg')} [size='md'] - Button size
 * @props {IconDefinition} [icon] - FontAwesome icon
 * @props {('button'|'label')} [is='button'] - Component element type
 * @props {string} [name] - For aria-label
 * @props {string} [title] - For tooltip
 *
 * @exposes {Function} focus - Focuses the button element
 * @exposes {Ref<HTMLElement>} innerButton - Reference to the button element
 */
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';

import type { AppButtonProps } from '../../types/button';
import {
  type ButtonSize,
  type ButtonVariant,
  getButtonSizeClasses,
  getButtonVariantClasses,
} from '../../utils/variants';

// Re-export types for public API
export type { ButtonVariant, ButtonSize } from '../../utils/variants';
export type { AppButtonProps } from '../../types/button';

// Variant and size classes are now provided by utility functions

// Props interface is now imported from types

const props = withDefaults(defineProps<AppButtonProps>(), {
  disabled: false,
  loading: false,
  type: 'button',
  href: undefined,
  external: false,
  to: undefined,
  variant: 'primary',
  size: 'md',
  icon: undefined,
  is: 'button',
  name: undefined,
  title: undefined,
});

const innerButton = ref<HTMLElement | null>(null);

const focus = () => {
  if (innerButton.value) {
    innerButton.value.focus();
  }
};

const buttonClasses = computed(() => {
  return [
    // Base styles
    'leading-tight inline-flex gap-2 justify-center items-center font-bold rounded whitespace-nowrap relative border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-70',
    // Styles for in a button group
    'group-[]/btns:rounded-none group-[]/btns:last:rounded-r group-[]/btns:first:rounded-l group-[]/btns:-ml-px group-[]/btns:hover:z-10',
    // Size styles
    getButtonSizeClasses(props.size),
    // Variant styles
    getButtonVariantClasses(props.variant, 'base'),
    // Disabled/enabled styles
    props.disabled
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer ' + getButtonVariantClasses(props.variant, 'hover'),
  ];
});

const loadingIconClasses = computed(() =>
  getButtonVariantClasses(props.variant, 'loading')
);

// Allow to focus the button from outside
defineExpose({
  focus,
  innerButton,
});
</script>
