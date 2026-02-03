<!--
  # AppTemplate (reference only)
  Reference template for new Vue components. Not used in the application.
  Copy this file when creating a new component; adapt props, slots, and styling to your needs.
  See .cursor/rules/new-vue-component.mdc for the full workflow.

  ## Patterns demonstrated
  - TypeScript props interface with JSDoc, withDefaults()
  - defineEmits<>() with typed events and TSDoc
  - defineSlots<>() for slot documentation
  - Optional id prop + generateUniqueId() for ARIA (per-instance IDs)
  - Semantic HTML, ARIA attributes, keyboard support
  - Tailwind: design tokens (primary-*, danger-*, etc.), mobile-first
-->
<template>
  <div
    class="rounded border p-4 transition-colors"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      disabled
        ? 'cursor-not-allowed opacity-50'
        : 'cursor-pointer hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-70 focus:ring-offset-2',
    ]"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-label="ariaLabel || title"
    :aria-describedby="description ? `${componentId}-description` : undefined"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Header with icon and title -->
    <header v-if="title || icon || badge" class="mb-3 flex items-center gap-3">
      <font-awesome-icon
        v-if="icon"
        :icon="icon"
        class="text-current h-5 w-5"
        aria-hidden="true"
      />

      <h3 v-if="title" class="flex-1 font-semibold text-body">
        {{ title }}
      </h3>

      <span
        v-if="badge"
        class="rounded-full bg-primary px-2 py-1 text-xs font-medium text-white"
      >
        {{ badge }}
      </span>
    </header>

    <!-- Optional description -->
    <p
      v-if="description"
      :id="`${componentId}-description`"
      class="mb-3 text-sm text-body-80"
    >
      {{ description }}
    </p>

    <!-- Main content slot -->
    <div v-if="$slots.default" class="mb-3 last:mb-0">
      <slot />
    </div>

    <!-- Footer slot -->
    <footer v-if="$slots.footer" class="border-t border-grey-light pt-3">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
/**
 * Reference template for new components. Copy and adapt; see block comment above.
 *
 * @component AppTemplate
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { generateUniqueId } from '../../utils';

// --- Props
export interface AppTemplateProps {
  /** Main title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional header icon */
  icon?: IconDefinition;
  /** Optional badge text in header */
  badge?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Override for aria-label (defaults to title) */
  ariaLabel?: string;
  /** Optional id for ARIA; fallback to generated id */
  id?: string;
}

const props = withDefaults(defineProps<AppTemplateProps>(), {
  title: undefined,
  description: undefined,
  variant: 'primary',
  size: 'md',
  icon: undefined,
  badge: undefined,
  disabled: false,
  ariaLabel: undefined,
  id: undefined,
});

// --- Events
const emit = defineEmits<{
  click: [event: Event];
  activate: [event: KeyboardEvent];
}>();

// --- Slots (documentation only)
defineSlots<{
  default(): unknown;
  footer(): unknown;
}>();

// --- State (per-instance ID for ARIA)
const componentId = props.id ?? generateUniqueId('template');

// --- Styling maps (replace with your component’s variants)
const variantClasses = {
  primary: 'border-primary-40 bg-primary-5 text-primary-80',
  secondary: 'border-grey-light bg-grey-lighter text-body',
  success: 'border-success-30 bg-success-10 text-success-110',
  warning: 'border-warning-30 bg-warning-10 text-warning',
  danger: 'border-danger-30 bg-danger-10 text-danger-110',
} as const;

const sizeClasses = {
  sm: 'p-3 text-sm',
  md: 'p-4',
  lg: 'p-6 text-lg',
} as const;

// --- Handlers
function handleClick(event: Event): void {
  if (!props.disabled) emit('click', event);
}

function handleKeydown(event: KeyboardEvent): void {
  if (!props.disabled && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    emit('activate', event);
  }
}
</script>
