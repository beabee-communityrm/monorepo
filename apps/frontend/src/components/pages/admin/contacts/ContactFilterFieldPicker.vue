<!--
  # ContactFilterFieldPicker
  Searchable, drill-down picker for the fields a contact filter can be built on.

  Navigation is: all fields → a field group → a field, with crowdNewsrooms as an
  extra branch that steps through crowdNewsroom → response information/answers.
  Question fields only become searchable once their crowdNewsroom is opened,
  because that's when its form schema is loaded.
-->
<template>
  <div class="flex max-h-96 w-80 flex-col gap-0.5 overflow-y-auto p-2">
    <UInput
      v-model="query"
      variant="subtle"
      :placeholder="t('advancedSearch.searchFields-nuxt')"
      class="mb-1"
      autofocus
    />

    <template v-for="(entry, i) in entries" :key="i">
      <p v-if="entry.kind === 'header'" class="text-muted px-2.5 pt-2 pb-1">
        {{ entry.label }}
      </p>
      <UButton
        v-else-if="entry.kind === 'back'"
        color="neutral"
        variant="ghost"
        icon="i-lucide-chevron-left"
        block
        class="justify-start"
        @click="path = entry.path"
      >
        {{ entry.label }}
      </UButton>
      <UButton
        v-else-if="entry.kind === 'branch'"
        color="neutral"
        variant="ghost"
        trailing-icon="i-lucide-chevron-right"
        block
        class="justify-between font-medium"
        @click="path = entry.path"
      >
        {{ entry.label }}
      </UButton>
      <UButton
        v-else
        color="neutral"
        variant="ghost"
        block
        class="justify-between gap-2"
        @click="emit('select', entry.field, entry.item)"
      >
        <span class="text-left">{{ entry.label }}</span>
        <UBadge color="neutral" variant="soft" class="shrink-0">
          {{ typeLabel(entry.item) }}
        </UBadge>
      </UButton>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { GetCalloutData } from '@beabee/beabee-common';

import { ItemStatus } from '@beabee/beabee-common';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { client } from '#utils/api';

import type {
  FilterGroups,
  FilterItem,
  FilterItems,
} from '../../../../type/search';
import { useCalloutContactFilters } from './contacts.interface';

const { t } = useI18n();

const props = defineProps<{
  /** The field groups to pick from, excluding the crowdNewsroom group */
  filterGroups: FilterGroups;
}>();

const emit = defineEmits<{
  (event: 'select', field: string, item: FilterItem): void;
}>();

type PickerPath =
  | { type: 'root' }
  | { type: 'group'; groupId: string }
  | { type: 'callouts' }
  | { type: 'callout'; calloutId: string }
  | { type: 'calloutGroup'; calloutId: string; groupId: string };

type PickerEntry =
  | { kind: 'header'; label: string }
  | { kind: 'back'; label: string; path: PickerPath }
  | { kind: 'branch'; label: string; path: PickerPath }
  | { kind: 'field'; label: string; field: string; item: FilterItem };

const query = ref('');
const path = ref<PickerPath>({ type: 'root' });

// Cached for the session: the picker is remounted every time it's opened, and
// the crowdNewsroom list is the same for every rule.
let calloutsRequest: Promise<GetCalloutData[]> | undefined;

function listCallouts() {
  calloutsRequest ||= client.callout
    .list({
      rules: {
        condition: 'OR',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
          { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
        ],
      },
      sort: 'title',
    })
    .then((result) => result.items);
  return calloutsRequest;
}

const callouts = ref<GetCalloutData[]>([]);
onBeforeMount(async () => {
  callouts.value = await listCallouts();
});

const openCalloutId = computed(() =>
  path.value.type === 'callout' || path.value.type === 'calloutGroup'
    ? path.value.calloutId
    : undefined
);

const {
  callout: openCallout,
  participationItems,
  groups: calloutGroups,
} = useCalloutContactFilters(openCalloutId);

function toFields(items: FilterItems): PickerEntry[] {
  return Object.entries(items).map(([field, item]) => ({
    kind: 'field',
    label: item.label,
    field,
    item,
  }));
}

function matches(label: string) {
  return label.toLowerCase().includes(query.value.trim().toLowerCase());
}

/** Every field of the currently open crowdNewsroom, grouped for display */
const openCalloutGroups = computed(() => [
  { label: openCallout.value?.title || '', items: participationItems.value },
  ...calloutGroups.value.map((group) => ({
    label: group.label,
    items: group.items,
  })),
]);

const searchEntries = computed<PickerEntry[]>(() => {
  const entries: PickerEntry[] = [];

  const groups = openCalloutId.value
    ? openCalloutGroups.value
    : props.filterGroups;

  for (const group of groups) {
    const fields = toFields(group.items).filter((entry) =>
      matches(entry.label)
    );
    if (fields.length) {
      entries.push({ kind: 'header', label: group.label }, ...fields);
    }
  }

  if (!openCalloutId.value) {
    const hits = callouts.value.filter((callout) => matches(callout.title));
    if (hits.length) {
      entries.push({
        kind: 'header',
        label: t('contacts.dataGroup.callout-nuxt'),
      });
      for (const callout of hits) {
        entries.push({
          kind: 'branch',
          label: callout.title,
          path: { type: 'callout', calloutId: callout.id },
        });
      }
    }
  }

  return entries.length
    ? entries
    : [
        {
          kind: 'header',
          label: t('advancedSearch.noFieldsMatch-nuxt', { query: query.value }),
        },
      ];
});

const browseEntries = computed<PickerEntry[]>(() => {
  const backToRoot: PickerEntry = {
    kind: 'back',
    label: t('advancedSearch.allFields-nuxt'),
    path: { type: 'root' },
  };

  switch (path.value.type) {
    case 'group': {
      const groupId = path.value.groupId;
      const group = props.filterGroups.find((g) => g.id === groupId);
      return group
        ? [
            backToRoot,
            { kind: 'header', label: group.label },
            ...toFields(group.items),
          ]
        : [backToRoot];
    }

    case 'callouts':
      return [
        backToRoot,
        { kind: 'header', label: t('contacts.dataGroup.callout-nuxt') },
        ...callouts.value.map<PickerEntry>((callout) => ({
          kind: 'branch',
          label: callout.title,
          path: { type: 'callout', calloutId: callout.id },
        })),
      ];

    case 'callout': {
      const calloutId = path.value.calloutId;
      return [
        {
          kind: 'back',
          label: t('contacts.dataGroup.callout-nuxt'),
          path: { type: 'callouts' },
        },
        { kind: 'header', label: openCallout.value?.title || '' },
        ...toFields(participationItems.value),
        ...calloutGroups.value.map<PickerEntry>((group) => ({
          kind: 'branch',
          label: group.label,
          path: { type: 'calloutGroup', calloutId, groupId: group.id },
        })),
      ];
    }

    case 'calloutGroup': {
      const { calloutId, groupId } = path.value;
      const group = calloutGroups.value.find((g) => g.id === groupId);
      return [
        {
          kind: 'back',
          label: openCallout.value?.title || '',
          path: { type: 'callout', calloutId },
        },
        ...(group
          ? [
              { kind: 'header' as const, label: group.label },
              ...toFields(group.items),
            ]
          : []),
      ];
    }

    default:
      return [
        { kind: 'header', label: t('advancedSearch.allFields-nuxt') },
        ...props.filterGroups.map<PickerEntry>((group) => ({
          kind: 'branch',
          label: group.label,
          path: { type: 'group', groupId: group.id },
        })),
        {
          kind: 'branch',
          label: t('contacts.dataGroup.callout-nuxt'),
          path: { type: 'callouts' },
        },
      ];
  }
});

const entries = computed(() =>
  query.value.trim() ? searchEntries.value : browseEntries.value
);

function typeLabel(item: FilterItem) {
  return t(`advancedSearch.fieldType-nuxt.${item.type}`, {
    count: 'options' in item ? (item.options?.length ?? 0) : 0,
  });
}
</script>
