<!--
  # HomeListCard
  The frame for a list card on the home page: a heading with an optional count,
  divided rows, and an optional footer link or button.

  Renders a row per item, with the row's content from the default slot. While
  `items` is undefined, two rows of the `loading` slot show instead (plain
  skeleton lines by default); when it's empty, `emptyText` does.
-->
<template>
  <UCard :ui="{ body: 'p-0 sm:p-0', footer: 'p-0 sm:p-0' }">
    <template #header>
      <AppCardHeader :icon="icon" :title="title" :level="level">
        <template v-if="count && items" #aside>
          <span class="shrink-0 text-muted">{{ count }}</span>
        </template>
      </AppCardHeader>
    </template>

    <ul v-if="!items" class="divide-y divide-default">
      <li v-for="n in 2" :key="n" :class="rowClass">
        <slot name="loading">
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-1/3" />
          </div>
        </slot>
      </li>
    </ul>

    <p v-else-if="items.length === 0" class="p-4 text-muted sm:px-6">
      {{ emptyText }}
    </p>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="item in items"
        :key="itemKey(item)"
        :class="[
          rowClass,
          'relative',
          interactive && 'transition-colors hover:bg-elevated',
        ]"
      >
        <slot :item="item" />
      </li>
    </ul>

    <template v-if="footerLabel && items?.length" #footer>
      <component
        :is="footerTo ? RouterLink : 'button'"
        :to="footerTo"
        :type="footerTo ? undefined : 'button'"
        class="group/footer flex w-full cursor-pointer items-center gap-1 px-4 py-3 font-medium text-primary hover:bg-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-6"
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

<script lang="ts" setup generic="T">
import { AppCardHeader } from '@beabee/vue';

import { RouterLink } from 'vue-router';

/** Props for HomeListCard */
export interface HomeListCardProps<T> {
  /** Items to show a row for; undefined while loading */
  items: T[] | undefined;
  /** A unique key for an item */
  itemKey: (item: T) => string;
  /** Card heading */
  title: string;
  /** Iconify icon name, shown in a badge before the heading */
  icon: string;
  /** Heading level, so the page's outline stays nested */
  level?: 2 | 3 | 4;
  /** Shown beside the heading, e.g. "4 open" */
  count?: string;
  /** Rows highlight on hover, for rows that are links */
  interactive?: boolean;
  /** Text for when there are no rows */
  emptyText?: string;
  /** Footer label; no footer without it */
  footerLabel?: string;
  /** Where the footer links to; without it the footer is a button */
  footerTo?: string;
  /** Icon after the footer label */
  footerIcon?: string;
}

withDefaults(defineProps<HomeListCardProps<T>>(), {
  level: 3,
  count: undefined,
  interactive: true,
  emptyText: undefined,
  footerLabel: undefined,
  footerTo: undefined,
  footerIcon: 'i-lucide-chevron-right',
});

const emit = defineEmits<{ footerClick: [] }>();

defineSlots<{
  default(props: { item: T }): unknown;
  loading?(): unknown;
}>();

const rowClass = 'flex flex-wrap items-start gap-x-4 gap-y-3 p-4 sm:px-6';
</script>
