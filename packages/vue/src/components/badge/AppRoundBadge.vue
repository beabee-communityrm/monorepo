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
    :class="[getBadgeSizeClasses(size), getBadgeColorClasses(type)]"
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

import type { AppRoundBadgeProps } from '../../types/badge';
import {
  getBadgeColorClasses,
  getBadgeSizeClasses,
} from '../../utils/variants';

const props = withDefaults(defineProps<AppRoundBadgeProps>(), {
  size: 'large',
  ariaLabel: undefined,
});

// Generate accessible label if not provided
const ariaLabel = computed(() => {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }
  return `${props.type} status indicator`;
});
</script>
