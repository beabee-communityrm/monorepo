<!--
  # ContactsSegmentFilter
  The saved segments to filter contacts by: a column beside the table from
  `md` up, and a scrolling row of chips below that.
-->
<template>
  <ul
    :aria-label="t('contacts.segments-nuxt')"
    class="hidden w-52 shrink-0 flex-col border-r border-default p-2 md:flex"
  >
    <li v-for="segment in segments" :key="segment.to">
      <ULink
        :to="segment.to"
        :aria-current="isCurrent(segment) ? 'true' : undefined"
        raw
        class="flex w-full items-center gap-1.5 rounded-md px-2.5 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="
          isCurrent(segment)
            ? 'bg-primary/10 text-primary'
            : 'text-muted hover:bg-elevated hover:text-highlighted'
        "
      >
        <span class="truncate">{{ segment.label }}</span>
        <UBadge
          v-if="segment.count !== undefined"
          :label="segment.count"
          :color="isCurrent(segment) ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          class="ms-auto shrink-0"
        />
      </ULink>
    </li>
  </ul>

  <ul
    :aria-label="t('contacts.segments-nuxt')"
    class="flex shrink-0 gap-1.5 overflow-x-auto border-b border-default px-4 py-2.5 md:hidden"
  >
    <li v-for="segment in segments" :key="segment.to" class="shrink-0">
      <ULink
        :to="segment.to"
        :aria-current="isCurrent(segment) ? 'true' : undefined"
        raw
        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="
          isCurrent(segment)
            ? 'border-primary/35 bg-primary/10 font-medium text-primary'
            : 'border-default text-muted hover:bg-elevated hover:text-default'
        "
      >
        {{ segment.label }}
        <UBadge
          v-if="segment.count !== undefined"
          :label="segment.count"
          :color="isCurrent(segment) ? 'primary' : 'neutral'"
          variant="soft"
        />
      </ULink>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import type { SegmentFilterItem } from '#type';

const { t } = useI18n();

const props = defineProps<{
  /** The segments to list, in display order */
  segments: SegmentFilterItem[];
  /** The selected segment, empty for all contacts */
  currentSegmentId: string;
}>();

function isCurrent(segment: SegmentFilterItem) {
  return segment.id === props.currentSegmentId;
}
</script>
