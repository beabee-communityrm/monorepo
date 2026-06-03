<!--
  # AppTable
  A reusable data table component with sorting, selection, and slot support.

  ## Features:
  - Sortable columns
  - Row selection
  - Flexible slot system for custom content
  - Keyboard navigation support
  - Responsive design with Tailwind CSS
  - Accessible with ARIA attributes

  ## Props:
  - `headers`: Array of column definitions
  - `items`: Array of data items to display
  - `sort`: Current sort configuration
  - `selectable`: Enable row selection
  - `hideHeaders`: Hide table headers
  - `rowClass`: Function to add custom row classes

  ## Events:
  - `update:sort`: Emitted when sort changes

  ## Slots:
  - `header-{column}`: Custom header content
  - `value-{column}`: Custom cell content
  - `after`: Content after each row
  - `empty`: Custom empty state
  - `loading`: Custom loading state

  ## Internal i18n usage:
  - common.noResults: "No results found"
  - common.loading: "Loading..."
-->
<template>
  <table class="border-b border-primary-20">
    <thead v-if="!hideHeaders" class="text-sm">
      <tr class="align-bottom">
        <th v-if="selectable" class="w-0 p-2">
          <AppCheckbox
            :model-value="allSelected"
            :indeterminate="isIndeterminate"
            @update:model-value="setAll"
          />
        </th>
        <th
          v-for="(header, i) in headers"
          :key="i"
          class="relative p-2 font-semibold whitespace-nowrap text-body-80"
          :class="{
            'cursor-pointer': header.sortable,
            'font-bold text-primary': header.value === sort?.by,
          }"
          :align="header.align || 'left'"
          :style="{ width: header.width }"
          @click="sortBy(header)"
        >
          <slot :name="`header-${header.value}`" :header="header">{{
            header.text
          }}</slot>
          <font-awesome-icon
            v-if="header.value === sort?.by"
            class="ml-2"
            :icon="sort.type === SortType.Asc ? faCaretDown : faCaretUp"
          />
          <font-awesome-icon
            v-else-if="header.sortable"
            class="ml-2 text-body-60"
            :icon="faSort"
          />
        </th>
      </tr>
    </thead>

    <tbody class="text-xs lg:text-sm">
      <tr
        v-if="!items || items.length === 0"
        class="border-t border-primary-20"
      >
        <td v-if="selectable" />
        <td :colspan="headers.length" class="p-2">
          <slot :name="items ? 'empty' : 'loading'">
            <p>{{ items ? t('common.noResults') : t('common.loading') }}</p>
          </slot>
        </td>
      </tr>

      <template v-for="(item, i) in items" :key="i">
        <tr
          class="border-t border-primary-20 align-top"
          :class="rowClasses(item)"
        >
          <td v-if="selectable" class="p-2">
            <AppCheckbox
              :model-value="selectedIds.includes(item.id)"
              @update:model-value="(checked) => setOne(item.id, checked)"
            />
          </td>
          <td
            v-for="(header, j) in headers"
            :key="j"
            class="p-2"
            :align="header.align || undefined"
          >
            <slot
              :name="`value-${header.value}`"
              :item="item"
              :value="item[header.value]"
            >
              {{ item[header.value] }}
            </slot>
          </td>
        </tr>
        <tr
          v-if="hasSlotContent($slots.after, { item })"
          :class="rowClasses(item)"
        >
          <td v-if="selectable" />
          <td class="p-2 pt-0" :colspan="headers.length">
            <slot name="after" :item="item" />
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script lang="ts" setup generic="I extends Item">
/**
 * Data table component with sorting and selection capabilities.
 *
 * Uses internal i18n for:
 * - Empty state message: common.noResults
 * - Loading state message: common.loading
 *
 * @component AppTable
 */
import { AppCheckbox } from '@beabee/vue';

import {
  faCaretDown,
  faCaretUp,
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { SortType } from '../../constants';
import { type Header, type Item, type Sort } from '../../types/table';
import { hasSlotContent } from '../../utils/slots';

/**
 * Props for the AppTable component
 */
export interface AppTableProps<I extends Item> {
  /** Current sort configuration */
  sort?: Sort;
  /** Array of column definitions */
  headers: Header[];
  /** Array of data items to display (null for loading state) */
  items: I[] | null;
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Hide the table headers */
  hideHeaders?: boolean;
  /** Function to add custom CSS classes to rows */
  rowClass?: (item: I) => string;
  /** Array of selected item IDs */
  selectedIds?: string[];
}

const props = withDefaults(defineProps<AppTableProps<I>>(), {
  sort: undefined,
  items: null,
  selectable: false,
  hideHeaders: false,
  rowClass: undefined,
});

const { t } = useI18n();

/**
 * Events emitted by the AppTable component
 */
const emit = defineEmits<{
  /**
   * Emitted when the sort configuration changes
   * @param sort - The new sort configuration
   */
  'update:sort': [sort: Sort];
}>();

// Models
const selectedIds = defineModel<string[]>('selectedIds', {
  required: false,
  default: () => [],
});

// Computed properties
const sort = computed({
  get: () => props.sort,
  set: (value) => value && emit('update:sort', value),
});

const allIds = computed(() => props.items?.map((i) => i.id) || []);

const allSelected = computed(
  () => allIds.value.length === selectedIds.value.length
);

const isIndeterminate = computed(
  () => selectedIds.value.length > 0 && !allSelected.value
);

// Methods
function rowClasses(item: I): string {
  return (
    (props.rowClass ? props.rowClass(item) : '') +
    (props.selectable && selectedIds.value.includes(item.id)
      ? ' bg-primary-10'
      : '')
  );
}

function sortBy(header: Header): void {
  if (!header.sortable) return;

  sort.value = {
    by: header.value,
    type:
      sort.value?.by === header.value && sort.value.type === SortType.Asc
        ? SortType.Desc
        : SortType.Asc,
  };
}

function setOne(id: string, checked: boolean) {
  selectedIds.value = checked
    ? [...new Set([...selectedIds.value, id])]
    : selectedIds.value.filter((selectedId) => selectedId !== id);
}

function setAll(checked: boolean) {
  selectedIds.value = checked ? [...allIds.value] : [];
}
</script>
