<!--
  # AppColor
  A color display component that shows a color swatch with its associated name or shade.
  Useful for color palettes, theme displays, and design system documentation.

  ## Features:
  - Visual color representation with circular swatch
  - Configurable color class names
  - Accessible color identification
  - Responsive design
  - Semantic HTML structure
-->
<template>
  <div
    class="inline-flex items-center gap-2"
    role="listitem"
    :aria-label="`Color: ${name}, Shade: ${shade}`"
  >
    <span
      class="h-10 w-10 flex-shrink-0 rounded-full border border-grey-light"
      :class="name"
      role="img"
      :aria-label="`Color swatch for ${name}`"
    />
    <span class="text-sm font-medium text-body">
      {{ shade }}
    </span>
  </div>
</template>

<script lang="ts" setup>
/**
 * Color display component that shows a visual color swatch alongside its name or shade.
 * Typically used in design systems, color palettes, and theme documentation.
 *
 * @component AppColor
 */

/**
 * Props for the AppColor component
 */
export interface AppColorProps {
  /** CSS class name that defines the background color of the swatch */
  name: string;
  /** Human-readable name or description of the color shade */
  shade: string;
}

defineProps<AppColorProps>();
</script>
