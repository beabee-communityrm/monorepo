<!--
  # ContactsTable
  The contact list: a selectable row per contact with sortable columns, the
  select-all banner above and the pagination below. The page holds the sort,
  paging and selection state for the bulk actions; this shares the same
  `selectionState` and handles everything shown.
-->
<template>
  <AppSelectAllBanner
    v-if="showSelectAllBanner"
    :mode="selectionState.mode"
    :selected-count="selectedCount"
    :total="total"
    key-prefix="contacts.selectAllBanner-nuxt"
    @select-all="selectAllMatching"
    @clear="clearSelection"
  />

  <div class="flex-1 bg-muted">
    <UTable
      :data="contacts ?? []"
      :columns="columns"
      :get-row-id="getRowId"
      :row-selection="rowSelection"
      :loading="!contacts"
      :meta="{ class: { tr: lastRowClass } }"
      class="bg-default"
    >
      <template #select-header>
        <UCheckbox
          :model-value="headerCheckboxValue"
          :aria-label="t('common.selectAll')"
          @update:model-value="toggleAllOnPage"
        />
      </template>

      <template #select-cell="{ row }">
        <UCheckbox
          :model-value="isSelected(row.original.id)"
          :aria-label="row.original.displayName"
          @update:model-value="
            (checked: boolean | 'indeterminate') =>
              setSelected(row.original.id, checked === true)
          "
        />
      </template>

      <template
        v-for="column in sortColumns"
        :key="column.id"
        #[`${column.id}-header`]
      >
        <UButton
          color="neutral"
          variant="ghost"
          class="-mx-2.5"
          :class="sort.by === column.id ? 'text-highlighted' : 'text-muted'"
          :trailing-icon="sortIcon(column.id)"
          @click="sortBy(column.id)"
        >
          {{ column.label }}
        </UButton>
      </template>

      <template #firstname-cell="{ row }">
        <router-link
          :to="`/admin/contacts/${row.original.id}`"
          class="font-medium text-primary hover:underline"
        >
          {{ row.original.displayName }}
        </router-link>
        <p v-if="row.original.profile.description" class="mt-1">
          {{ row.original.profile.description }}
        </p>
        <div v-if="row.original.tags?.length" class="mt-1 flex flex-wrap gap-1">
          <UBadge
            v-for="tag in row.original.tags"
            :key="tag.id"
            as="button"
            type="button"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            @click="emit('selectTag', tag.id)"
          >
            {{ tag.name }}
          </UBadge>
        </div>
      </template>

      <template #email-cell="{ row }">
        {{ row.original.email }}
      </template>

      <template #contributionMonthlyAmount-cell="{ row }">
        <UBadge
          v-if="row.original.contributionAmount"
          color="primary"
          variant="subtle"
        >
          {{ n(row.original.contributionAmount, 'currency') }}
          {{
            row.original.contributionPeriod === ContributionPeriod.Monthly
              ? t('common.perMonth')
              : t('common.perYear')
          }}
        </UBadge>
        <span v-else class="text-dimmed">—</span>
      </template>

      <template #joined-cell="{ row }">
        {{ formatLocale(row.original.joined, 'PPP') }}
      </template>

      <template #membershipStarts-cell="{ row }">
        {{ getMembershipStartDate(row.original) }}
      </template>

      <template #loading>
        {{ t('common.loading') }}
      </template>

      <template #empty>
        {{ emptyText }}
      </template>
    </UTable>
  </div>

  <AppTablePagination
    v-model:page="page"
    v-model:limit="limit"
    :total="total"
    class="sticky bottom-0 z-10 -mt-px bg-default"
  />
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  type GetContactDataWith,
  type GetContactWith,
} from '@beabee/beabee-common';
import {
  AppSelectAllBanner,
  AppTablePagination,
  type Sort,
  SortType,
  formatLocale,
} from '@beabee/vue';

import type { TableColumn, TableRow } from '@nuxt/ui';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useSelectionState } from '#composables/useSelectionState';
import type { SelectionState } from '#type';

const { t, n } = useI18n();

const props = defineProps<{
  /** The contacts on this page, undefined while loading */
  contacts?: GetContactDataWith<
    GetContactWith.Profile | GetContactWith.Roles | GetContactWith.Tags
  >[];
  /** Number of contacts matching the filters, across all pages */
  total: number;
  /** Shown when there are no contacts to list */
  emptyText: string;
}>();

const emit = defineEmits<{
  (event: 'selectTag', tagId: string): void;
}>();

const sort = defineModel<Sort>('sort', { required: true });
/** Current page, zero-based */
const page = defineModel<number>('page', { required: true });
const limit = defineModel<number>('limit', { required: true });
const selectionState = defineModel<SelectionState>('selectionState', {
  required: true,
});

const {
  selectedCount,
  allOnPageSelected,
  someOnPageSelected,
  isSelected,
  setSelected,
  toggleAllOnPage,
  selectAllMatching,
  clearSelection,
} = useSelectionState(
  computed(() => props.contacts ?? []),
  computed(() => props.total),
  selectionState
);

const headerCheckboxValue = computed<boolean | 'indeterminate'>(() =>
  allOnPageSelected.value
    ? true
    : someOnPageSelected.value
      ? 'indeterminate'
      : false
);

/** Once the whole page is selected, offer the rows on other pages too */
const showSelectAllBanner = computed(() =>
  selectionState.value.mode === 'all'
    ? selectedCount.value > 0
    : allOnPageSelected.value && props.total > (props.contacts?.length ?? 0)
);

const sortColumns = computed(() => [
  { id: 'firstname', label: t('contacts.data.name') },
  { id: 'email', label: t('contacts.data.email') },
  { id: 'contributionMonthlyAmount', label: t('contacts.data.contribution') },
  { id: 'joined', label: t('contacts.data.joined') },
  { id: 'membershipStarts', label: t('contacts.data.membershipStarts') },
]);

const columns = computed<
  TableColumn<NonNullable<typeof props.contacts>[number]>[]
>(() => [
  { id: 'select', meta: { class: { td: 'align-top' } } },
  ...sortColumns.value.map((column) => ({
    id: column.id,
    meta: {
      class: {
        td:
          column.id === 'firstname'
            ? 'w-full whitespace-normal align-top'
            : 'align-top tabular-nums',
      },
    },
  })),
]);

const rowSelection = computed(() =>
  Object.fromEntries(
    (props.contacts ?? []).map((contact) => [
      contact.id,
      isSelected(contact.id),
    ])
  )
);

function getRowId(contact: { id: string }) {
  return contact.id;
}

function lastRowClass(row: TableRow<unknown>) {
  return row.index === (props.contacts?.length ?? 0) - 1
    ? 'border-b border-default'
    : '';
}

function sortIcon(id: string) {
  if (sort.value.by !== id) return 'i-lucide-chevrons-up-down';
  return sort.value.type === SortType.Asc
    ? 'i-lucide-chevron-up'
    : 'i-lucide-chevron-down';
}

function sortBy(id: string) {
  sort.value = {
    by: id,
    type:
      sort.value.by === id && sort.value.type === SortType.Asc
        ? SortType.Desc
        : SortType.Asc,
  };
}

function getMembershipStartDate(
  contact: GetContactDataWith<GetContactWith.Roles>
): string {
  const membership = contact.roles.find((role) => role.role === 'member');
  return membership ? formatLocale(membership.dateAdded, 'PPP') : '';
}
</script>
