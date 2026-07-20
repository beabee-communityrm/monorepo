<!--
  # AppIconBadge
  A small icon inside a rounded, tinted background badge — the leading
  visual used in section/modal headers (e.g. AppSectionCard, modal titles).
  Uses the same `rounded-lg` radius as other page components, not a circle.

  ## Props
  - `icon` (string): Iconify icon name, e.g. `i-lucide-shield-check`.
  - `color` (string, default 'primary'): semantic color for the tint/icon.
-->
<template>
  <div
    class="flex size-8 shrink-0 items-center justify-center rounded-lg"
    :class="COLOR_CLASSES[color].bg"
  >
    <UIcon :name="icon" class="size-4" :class="COLOR_CLASSES[color].icon" />
  </div>
</template>

<script lang="ts" setup>
/**
 * Icon inside a rounded, tinted background badge.
 *
 * @component AppIconBadge
 */
export interface AppIconBadgeProps {
  /** Iconify icon name, e.g. `i-lucide-shield-check` */
  icon: string;
  /** Semantic color for the tint/icon */
  color?: 'primary' | 'neutral' | 'error';
}

withDefaults(defineProps<AppIconBadgeProps>(), {
  color: 'primary',
});

// Written as full literal class strings (not built from the `color` prop
// dynamically), so Tailwind's build-time scanner can find them.
const COLOR_CLASSES = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary' },
  neutral: { bg: 'bg-neutral/10', icon: 'text-neutral' },
  error: { bg: 'bg-error/10', icon: 'text-error' },
} satisfies Record<NonNullable<AppIconBadgeProps['color']>, unknown>;
</script>
