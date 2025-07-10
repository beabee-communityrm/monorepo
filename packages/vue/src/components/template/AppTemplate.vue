<!--
  # AppTemplate
  This is a template component that demonstrates the standard patterns used in this Vue component library.
  It serves as a reference for creating new components with consistent structure and best practices.

  ## Patterns Demonstrated:
  - TypeScript interfaces with JSDoc
  - Props with defaults and validation
  - Events with proper typing and TSDoc documentation
  - Slots for flexible content
  - Accessibility with ARIA attributes
  - Semantic HTML elements
  - Tailwind CSS styling with responsive design
  - Focus management and keyboard navigation
  - Mobile-first design approach
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
 * Template component demonstrating standard patterns and best practices.
 * Use this as a reference when creating new components.
 *
 * @component AppTemplate
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { generateUniqueId } from '../../utils';

/**
 * Props for the AppTemplate component
 */
export interface AppTemplateProps {
  /** The main title displayed in the component */
  title?: string;
  /** Optional description text for additional context */
  description?: string;
  /** Visual variant of the component */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Size variant of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon to display in the header */
  icon?: IconDefinition;
  /** Optional badge text to display in the header */
  badge?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
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
});

/**
 * Events emitted by the AppTemplate component
 */
const emit = defineEmits<{
  /**
   * Emitted when the component is clicked
   * @param event - The click event
   */
  click: [event: Event];
  /**
   * Emitted when Enter or Space is pressed for keyboard activation
   * @param event - The keyboard event
   */
  activate: [event: KeyboardEvent];
}>();

/**
 * Slots available in the AppTemplate component
 */
defineSlots<{
  /**
   * Default slot for the main content area
   * @description Use this slot to provide the primary content of the component
   */
  default(): any;
  /**
   * Footer slot for action buttons or additional content
   * @description Typically used for buttons, links, or other interactive elements
   */
  footer(): any;
}>();

// Generate unique ID for ARIA relationships
const componentId = generateUniqueId('template');

// Variant-based styling classes
const variantClasses = {
  primary: 'border-primary-40 bg-primary-5 text-primary-80',
  secondary: 'border-grey-light bg-grey-lighter text-body',
  success: 'border-success-30 bg-success-10 text-success-110',
  warning: 'border-warning-30 bg-warning-10 text-warning',
  danger: 'border-danger-30 bg-danger-10 text-danger-110',
} as const;

// Size-based styling classes
const sizeClasses = {
  sm: 'p-3 text-sm',
  md: 'p-4',
  lg: 'p-6 text-lg',
} as const;

/**
 * Handles click events
 */
function handleClick(event: Event): void {
  if (!props.disabled) {
    emit('click', event);
  }
}

/**
 * Handles keyboard navigation (Enter and Space)
 */
function handleKeydown(event: KeyboardEvent): void {
  if (!props.disabled && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    emit('activate', event);
  }
}
</script>
