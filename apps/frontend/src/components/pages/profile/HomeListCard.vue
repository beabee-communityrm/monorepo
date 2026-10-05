<!--
  # HomeListCard
  The frame for a list card on the home page: a heading with an optional count,
  divided rows, and an optional footer link or button.

  Rows go in the default slot as `li` elements. While `loading`, the `loading`
  slot shows instead (two plain skeleton rows by default); with no rows,
  `emptyText` does.
-->
<template>
  <UCard
    :ui="{
      header: 'flex items-center justify-between gap-3 sm:px-4',
      body: 'p-0 sm:p-0',
      footer: 'p-0 sm:p-0',
    }"
  >
    <template #header>
      <div class="flex min-w-0 items-center gap-3">
        <AppIconBadge v-if="icon" :icon="icon" />
        <component :is="`h${level}`">{{ title }}</component>
      </div>
      <span v-if="count && !loading" class="text-muted">{{ count }}</span>
    </template>

    <ul v-if="loading" class="divide-y divide-default">
      <slot name="loading">
        <li v-for="n in 2" :key="n" class="space-y-2 p-4">
          <USkeleton class="h-4 w-2/3" />
          <USkeleton class="h-4 w-1/3" />
        </li>
      </slot>
    </ul>

    <p v-else-if="empty" class="p-4 text-muted">{{ emptyText }}</p>

    <ul v-else class="divide-y divide-default">
      <slot />
    </ul>

    <template v-if="footerLabel && !loading && !empty" #footer>
      <component
        :is="footerTo ? RouterLink : 'button'"
        :to="footerTo"
        :type="footerTo ? undefined : 'button'"
        class="group/footer flex w-full cursor-pointer items-center gap-1 px-4 py-3 font-medium text-primary hover:bg-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        @click="footerTo || emit('footerClick')"
      >
        {{ footerLabel }}
        <UIcon
          :name="footerIcon"
          class="size-4 transition-transform"
          :class="
            footerIcon === 'i-lucide-chevron-right' &&
            'group-hover/footer:translate-x-0.5'
          "
          aria-hidden="true"
        />
      </component>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { AppIconBadge } from '@beabee/vue';

import { RouterLink } from 'vue-router';

/** Props for HomeListCard */
export interface HomeListCardProps {
  /** Card heading */
  title: string;
  /** Iconify icon name, shown in a badge before the heading */
  icon?: string;
  /** Heading level, so the page's outline stays nested */
  level?: 2 | 3 | 4;
  /** Shown beside the heading, e.g. "4 open" */
  count?: string;
  /** Shows the loading slot instead of the rows */
  loading?: boolean;
  /** Shows `emptyText` instead of the rows */
  empty?: boolean;
  /** Text for when there are no rows */
  emptyText?: string;
  /** Footer label; no footer without it */
  footerLabel?: string;
  /** Where the footer links to; without it the footer is a button */
  footerTo?: string;
  /** Icon after the footer label */
  footerIcon?: string;
}

withDefaults(defineProps<HomeListCardProps>(), {
  icon: undefined,
  level: 3,
  count: undefined,
  emptyText: undefined,
  footerLabel: undefined,
  footerTo: undefined,
  footerIcon: 'i-lucide-chevron-right',
});

const emit = defineEmits<{ footerClick: [] }>();
</script>
