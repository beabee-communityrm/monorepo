<template>
  <a
    v-if="href"
    :href="!disabled ? href : undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="buttonClasses"
  >
    <font-awesome-icon v-if="icon" :icon="icon" /><slot />
  </a>
  <router-link v-else-if="to" :to="to" :class="buttonClasses">
    <font-awesome-icon v-if="icon" :icon="icon" /><slot />
  </router-link>

  <component
    :is="is"
    v-else
    ref="innerButton"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :type="type"
  >
    <font-awesome-icon v-if="icon" :icon="icon" /><slot />
    <span v-if="loading" class="absolute inset-0 bg-white opacity-30" />
    <font-awesome-icon
      v-if="loading"
      class="absolute text-2xl"
      :class="loadingIconClasses"
      :icon="faCircleNotch"
      spin
    />
    <slot name="after" />
  </component>
</template>

<script lang="ts" setup>
/**
 * A versatile button component that can render as a button, link, or router-link
 * with various styles and states.
 *
 * @component AppButton
 *
 * @example
 * // Basic button
 * <AppButton>Click me</AppButton>
 *
 * // Primary button with loading state
 * <AppButton variant="primary" :loading="true">Loading...</AppButton>
 *
 * // External link button
 * <AppButton href="https://example.com" external>External Link</AppButton>
 *
 * // Router link button
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
 *
 * @exposes {Function} focus - Focuses the button element
 * @exposes {Ref<HTMLElement>} innerButton - Reference to the button element
 */

import {
  faCircleNotch,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { type RouteLocationRaw } from 'vue-router';

// Variant classes for [base, hover, loading icon]
const variantClasses = {
  primary: [
    'bg-primary-70 text-white border-primary-70',
    'hover:bg-primary-80',
    'text-primary',
  ],
  link: ['bg-link text-white border-link', 'hover:bg-link-110', 'text-link'],
  danger: [
    'bg-danger text-white border-danger',
    'hover:bg-danger-110',
    'text-danger',
  ],
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
  dangerText: ['underline text-danger border-0', 'hover:text-danger-110', ''],
} as const;

const sizeClasses = {
  xs: 'text-sm px-2 py-1',
  sm: 'text-sm p-2',
  md: 'px-3 py-2.5',
  lg: 'text-3xl px-4.5 py-4',
} as const;

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
    href?: string;
    external?: boolean;
    to?: RouteLocationRaw;
    variant?: keyof typeof variantClasses;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    icon?: IconDefinition;
    is?: 'button' | 'label';
  }>(),
  {
    type: 'button',
    href: undefined,
    external: false,
    to: undefined,
    variant: 'primary',
    size: 'md',
    icon: undefined,
    is: 'button',
  }
);

const innerButton = ref<HTMLAnchorElement | HTMLButtonElement | null>(null);

const focus = () => {
  if (innerButton.value) {
    innerButton.value.focus();
  }
};

const buttonClasses = computed(() => {
  return [
    // Base styles
    'leading-tight inline-flex gap-2 justify-center items-center font-bold rounded whitespace-nowrap relative border',
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
