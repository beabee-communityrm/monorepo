<!--
  # AppRoundBadge
  A circular status indicator badge component for showing success, warning, or danger states.

  ## Features:
  - Circular design with configurable size
  - Color-coded status types (success, warning, danger)
  - Two size variants (large and small)
  - Semantic status indication

  ## Usage:
  ```vue
  <AppRoundBadge type="success" />
  <AppRoundBadge type="warning" size="small" />
  <AppRoundBadge type="danger" />
  ```
-->
<template>
  <span
    class="inline-block rounded-full align-middle"
    :class="[sizeClasses[size], colorClasses[type]]"
    :aria-label="ariaLabel"
    role="img"
  />
</template>

<script lang="ts" setup>
/**
 * Circular status indicator badge component
 *
 * @component AppRoundBadge
 */
import { computed } from 'vue';

/**
 * Props for the AppRoundBadge component
 */
export interface AppRoundBadgeProps {
  /** Visual status type that determines the color */
  type: 'success' | 'warning' | 'danger';
  /** Size variant of the badge */
  size?: 'large' | 'small';
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AppRoundBadgeProps>(), {
  size: 'large',
  ariaLabel: undefined,
});

// Size-based classes mapping
const sizeClasses = {
  large: 'w-4 h-4',
  small: 'w-2 h-2',
} as const;

// Type-based color classes mapping
const colorClasses = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

// Generate accessible label if not provided
const ariaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }
  return `${props.type} status indicator`;
});
</script>
