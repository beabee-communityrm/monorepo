<!--
  # AppFormSkeleton
  A stack of skeleton "field" bars, for placeholder content while a form's
  real data is still loading (e.g. inside a <Suspense> `#fallback`). A
  fragment (no wrapping element), so the bars become direct children of
  whatever renders it — inside an AppSectionCard's body, that picks up its
  `space-y-4` automatically, matching how the real fields would sit.

  ## Props
  - `rows` (number, default 3): how many skeleton bars to show.
-->
<template>
  <USkeleton v-for="i in rows" :key="i" class="my-6 h-10 w-full" />
</template>

<script lang="ts" setup>
/**
 * A stack of skeleton "field" bars for a loading form. See the template
 * comment above.
 *
 * @component AppFormSkeleton
 */
export interface AppFormSkeletonProps {
  /** How many skeleton field rows to show */
  rows?: number;
}

withDefaults(defineProps<AppFormSkeletonProps>(), {
  rows: 3,
});
</script>
