<!--
  # AppSelectAllBanner
  Banner above a selectable table once every row on the page is selected,
  offering to extend the selection to every matching row, then to clear it.

  ## Internal i18n usage
  Under `keyPrefix`, which defaults to `common.table.selectAllBanner`:
  - pageSelected: "All {count} items on this page are selected."
  - selectAll: "Select all {count} items"
  - someSelected: "{count} matching items are selected."
  - allSelected: "All {count} matching items are selected."
  - clearSelection: "Clear selection"
-->
<template>
  <div
    class="flex flex-wrap items-center justify-center gap-2 border-b border-primary/20 bg-primary/6 p-3"
  >
    <template v-if="mode === 'explicit'">
      <span>
        {{ t(`${keyPrefix}.pageSelected`, { count: n(selectedCount) }) }}
      </span>
      <UButton variant="link" @click="emit('selectAll')">
        {{ t(`${keyPrefix}.selectAll`, { count: n(total) }) }}
      </UButton>
    </template>
    <template v-else>
      <span>
        {{
          t(
            `${keyPrefix}.${selectedCount < total ? 'someSelected' : 'allSelected'}`,
            { count: n(selectedCount) }
          )
        }}
      </span>
      <UButton variant="link" @click="emit('clear')">
        {{ t(`${keyPrefix}.clearSelection`) }}
      </UButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * Banner offering to select every matching row of a paginated table.
 *
 * @component AppSelectAllBanner
 */
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

export interface AppSelectAllBannerProps {
  /** `explicit` while only rows on this page are selected, `all` once every matching row is */
  mode: 'explicit' | 'all';
  /** Number of rows currently selected */
  selectedCount: number;
  /** Number of rows matching the current filters, across all pages */
  total: number;
  /** Where the banner's strings live, for wording specific to a page */
  keyPrefix?: string;
}

withDefaults(defineProps<AppSelectAllBannerProps>(), {
  keyPrefix: 'common.table.selectAllBanner',
});

const emit = defineEmits<{
  (event: 'selectAll'): void;
  (event: 'clear'): void;
}>();
</script>
