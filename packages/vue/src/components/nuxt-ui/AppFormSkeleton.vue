<!--
  # AppFormSkeleton
  A stack of skeleton "field" bars, for placeholder content while a form's
  real data is still loading (e.g. inside a <Suspense> `#fallback`).

  ## Props
  - `rows` (number, default 3): how many skeleton bars to show.
-->
<template>
  <div class="space-y-8">
    <template v-for="i in rows" :key="i">
      <div v-if="i === 2 && rows >= 2" class="flex gap-4">
        <USkeleton class="h-10 w-1/2" />
        <USkeleton class="h-10 w-1/2" />
      </div>
      <USkeleton v-else class="h-10 w-full" />
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * A stack of skeleton "field" bars for a loading form.
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
