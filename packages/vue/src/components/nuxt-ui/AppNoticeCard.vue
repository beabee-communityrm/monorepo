<!--
  # AppNoticeCard
  A tinted card for a short in-page notice: an icon, a title, body content and
  optional actions. Used where something needs explaining in place rather than
  interrupting — a confirmation, or a reason the page can't be used yet.

  The title is a heading, so it appears in the screen-reader outline where a
  labelled block of content belongs. A reusable card can't know its own depth,
  so `level` is the caller's to set — 3 suits a card sitting under a page's
  `h2`.

  ## Props
  - `icon` (string): Iconify icon name, e.g. `i-lucide-lock`.
  - `title` (string): Short label for the notice.
  - `level` (2 | 3 | 4 | 5 | 6, optional): Heading level for the title, so the
    page's outline stays correctly nested. Defaults to 3.
  - `color` ('primary' | 'success', optional): Tints the icon, edge and
    background. `success` also colours the title.
  - `fill` ('solid' | 'gradient', optional): Flat tint, or fading to
    transparent.
  - `size` ('md' | 'lg', optional): Title size. `lg` suits a notice that
    stands in for the page title.

  ## Slots
  - `default`: Body content.
  - `actions`: Buttons, laid out in a wrapping row.
-->
<template>
  <div
    class="flex flex-col gap-4 rounded-md p-5 ring"
    :class="[styles.ring, fill === 'gradient' ? styles.gradient : styles.solid]"
  >
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <UIcon
          :name="icon"
          class="shrink-0"
          :class="[styles.icon, size === 'lg' ? 'size-5' : 'size-4.5']"
          aria-hidden="true"
        />
        <component
          :is="`h${level}`"
          :class="[styles.title, size === 'lg' && 'text-lg']"
        >
          {{ title }}
        </component>
      </div>

      <slot />
    </div>

    <div v-if="$slots.actions" class="flex flex-wrap gap-2.5">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Tinted in-page notice with an icon, title, body and optional actions.
 *
 * @component AppNoticeCard
 */
import { computed } from 'vue';

export interface AppNoticeCardProps {
  /** Iconify icon name, e.g. `i-lucide-lock` */
  icon: string;
  /** Short label for the notice */
  title: string;
  /** Heading level for the title, so the page's outline stays nested */
  level?: 2 | 3 | 4 | 5 | 6;
  /** Tints the icon, edge and background; `success` also colours the title */
  color?: 'primary' | 'success';
  /** Flat tint, or fading to transparent */
  fill?: 'solid' | 'gradient';
  /** Title size; `lg` suits a notice that stands in for the page title */
  size?: 'md' | 'lg';
}

const props = withDefaults(defineProps<AppNoticeCardProps>(), {
  level: 3,
  color: 'primary',
  fill: 'solid',
  size: 'md',
});

defineSlots<{
  default(): unknown;
  actions?(): unknown;
}>();

const stylesByColor = {
  primary: {
    ring: 'ring-primary/20',
    solid: 'bg-primary/5',
    gradient: 'bg-tint-primary',
    icon: 'text-primary',
    title: 'text-highlighted',
  },
  success: {
    ring: 'ring-success/20',
    solid: 'bg-success/5',
    gradient: 'bg-tint-success',
    icon: 'text-success',
    title: 'text-success',
  },
} as const;

const styles = computed(() => stylesByColor[props.color]);
</script>
