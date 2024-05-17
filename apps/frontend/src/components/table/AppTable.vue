<template>
  <table class="border-b border-primary-20">
    <thead v-if="!hideHeaders" class="text-sm">
      <tr class="align-bottom">
        <th v-if="selectable" class="w-0 p-2">
          <AppCheckbox v-model="allSelected" class="h-5" />
        </th>
        <th
          v-for="(header, i) in headers"
          :key="i"
          class="relative whitespace-nowrap p-2 font-semibold text-body-80"
          :class="{
            'cursor-pointer': header.sortable,
            'font-bold text-primary': header.value === sort?.by,
          }"
          :align="header.align || 'left'"
          :style="{ width: header.width }"
          @click="sortBy(header)"
        >
          <slot :name="`header-${header.value}`">{{ header.text }}</slot>
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
            <AppCheckbox v-model="item.selected" />
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
import {
  faCaretDown,
  faCaretUp,
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { hasSlotContent } from '../../utils';
import AppCheckbox from '../forms/AppCheckbox.vue';
import { type Header, type Item, SortType } from './table.interface';

interface Sort {
  by: string | null;
  type: SortType;
}

const props = defineProps<{
  sort?: Sort;
  headers: Header[];
  items: I[] | null;
  selectable?: boolean;
  hideHeaders?: boolean;
  rowClass?: (item: I) => string;
}>();

const emit = defineEmits(['update:sort']);

const { t } = useI18n();

const sort = computed({
  get: () => props.sort,
  set: (value) => emit('update:sort', value),
});

const allSelected = computed({
  get: () =>
    props.selectable && props.items
      ? props.items.every((i) => i.selected)
      : false,
  set: (newValue) => {
    if (!props.items) return;
    for (const item of props.items) {
      item.selected = newValue;
    }
  },
});

function rowClasses(item: I): string {
  return (
    (props.rowClass ? props.rowClass(item) : '') +
    (props.selectable && item.selected ? ' bg-primary-10' : '')
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
</script>
