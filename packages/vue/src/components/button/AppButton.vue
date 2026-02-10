<template>
  <a
    v-if="href"
    :href="!disabled ? href : undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="buttonClasses"
    :title="title"
    :aria-label="accessibleLabel"
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
    :title="title"
    :aria-label="accessibleLabel"
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
    :title="title"
    :aria-label="accessibleLabel"
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
 * @props {string} [title] - Tooltip; also used as aria-label fallback
 * @props {string} [ariaLabel] - Accessible label (overrides title for aria-label)
 *
 * @exposes {Function} focus - Focuses the button element
 * @exposes {Ref<HTMLElement>} innerButton - Reference to the button element
 */
import {
  type IconDefinition,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { type RouteLocationRaw } from 'vue-router';

// Define the variant types
export type ButtonVariant =
  | 'primary'
  | 'link'
  | 'danger'
  | 'primaryOutlined'
  | 'linkOutlined'
  | 'dangerOutlined'
  | 'dangerGhost'
  | 'greyOutlined'
  | 'text'
  | 'dangerText';

// Define the size types
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// Variant classes for [base, hover, loading icon]
const variantClasses = {
  primary: [
    'bg-primary-70 text-white border-primary-70',
    'hover:bg-primary-80',
    'text-primary',
  ],
  link: ['bg-link text-white border-link', 'hover:bg-link-110', 'text-link'],
  primaryOutlined: [
    'bg-white text-primary-80 border-primary-40',
    'hover:bg-primary-10 hover:text-primary hover:border-primary-70',
    'text-primary',
  ],
  linkOutlined: [
    'bg-white text-link border-link',
    'hover:bg-link-10',
    'text-link',
  ],
  dangerOutlined: [
    'bg-white text-danger border-danger',
    'hover:bg-danger-10',
    'text-danger',
  ],
  greyOutlined: [
    'bg-white text-body-80 border-grey-light',
    'hover:border-grey',
    'text-body',
  ],
  text: ['underline text-link border-0', 'hover:text-link-110', ''],
  danger: [
    'bg-danger text-white border-danger',
    'hover:bg-danger-110',
    'text-danger',
  ],
  dangerText: ['underline text-danger border-0', 'hover:text-danger-110', ''],
  dangerGhost: [
    'bg-transparent border-0 text-body-60',
    'hover:text-danger-70',
    'text-body-60',
  ],
} as const;

const sizeClasses = {
  xs: 'text-sm px-2 py-1',
  sm: 'text-sm p-2',
  md: 'px-3 py-2.5',
  lg: 'text-3xl px-4.5 py-4',
} as const;

/**
 * Props for the AppButton component
 */
export interface AppButtonProps {
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading state */
  loading?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit';
  /** URL for anchor tag */
  href?: string;
  /** Opens link in new tab */
  external?: boolean;
  /** Vue Router destination */
  to?: RouteLocationRaw;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** FontAwesome icon */
  icon?: IconDefinition;
  /** Component element type */
  is?: 'button' | 'label';
  /** Tooltip and fallback for aria-label when no ariaLabel is set */
  title?: string;
  /** Accessible label (screen readers); falls back to title when not set */
  ariaLabel?: string;
}

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
  title: undefined,
  ariaLabel: undefined,
});

const innerButton = ref<HTMLElement | null>(null);

/** Value for aria-label: explicit ariaLabel or title as fallback */
const accessibleLabel = computed(() => props.ariaLabel || props.title);

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
    sizeClasses[props.size],
    // Variant styles
    variantClasses[props.variant][0],
    // Disabled/enabled styles
    props.disabled
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer ' + variantClasses[props.variant][1],
  ];
});

const loadingIconClasses = computed(() => variantClasses[props.variant][2]);

// Allow to focus the button from outside
defineExpose({
  focus,
  innerButton,
});
</script>
