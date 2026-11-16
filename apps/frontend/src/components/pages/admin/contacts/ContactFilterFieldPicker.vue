<!--
  # ContactFilterFieldPicker
  Searchable, drill-down picker for the fields a contact filter can be built on.

  Navigation is: all fields → a field group → a field, with CrowdNewsrooms as an
  extra branch that steps through CrowdNewsroom → response information/answers.
  Question fields only become searchable once their CrowdNewsroom is opened,
  because that's when its form schema is loaded. Navigation is kept here rather
  than in UCommandPalette's own `children`, so a level can load on demand.
-->
<template>
  <UCommandPalette
    v-model:search-term="query"
    :groups="groups"
    :fuse="{ resultLimit: Infinity }"
    :placeholder="t('advancedSearch.searchFields-nuxt')"
    class="max-h-96 w-80"
  >
    <template #item-trailing="{ item }">
      <UBadge
        v-if="item.typeLabel"
        color="neutral"
        variant="soft"
        class="shrink-0 py-0.5"
      >
        {{ item.typeLabel }}
      </UBadge>
      <UIcon
        v-else-if="item.isBranch"
        name="i-lucide-chevron-right"
        class="size-5 shrink-0 text-dimmed"
        aria-hidden="true"
      />
    </template>

    <template #empty>
      {{ query ? t('advancedSearch.noFieldsMatch-nuxt', { query }) : '' }}
    </template>
  </UCommandPalette>
</template>

<script lang="ts" setup>
import type { GetCalloutData } from '@beabee/beabee-common';
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui';

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
  /** The field groups to pick from, excluding the CrowdNewsroom group */
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

const query = ref('');
const path = ref<PickerPath>({ type: 'root' });

// Cached for the session: the picker is remounted every time it's opened, and
// the CrowdNewsroom list is the same for every rule.
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

function matches(label = '') {
  return label.toLowerCase().includes(query.value.trim().toLowerCase());
}

/** A palette group; filtering is done here, so search can reach every level */
function group(
  id: string,
  items: CommandPaletteItem[],
  label?: string
): CommandPaletteGroup {
  return { id, label, items, ignoreFilter: true };
}

/** An item that steps to another level, forwards or back */
function navItem(label: string, to: PickerPath, back = false) {
  return {
    label,
    ...(back ? { icon: 'i-lucide-chevron-left' } : { isBranch: true }),
    onSelect: (event: Event) => {
      // Stops the palette marking the item as selected
      event.preventDefault();
      goTo(to);
    },
  };
}

function fieldItems(items: FilterItems): CommandPaletteItem[] {
  return Object.entries(items).map(([field, item]) => ({
    label: item.label,
    typeLabel: typeLabel(item),
    disabled: hasNoOptions(item),
    onSelect: (event: Event) => {
      // Stops the palette marking the item as selected
      event.preventDefault();
      emit('select', field, item);
    },
  }));
}

/** Every field of the currently open CrowdNewsroom, grouped for display */
const openCalloutGroups = computed(() => [
  { label: openCallout.value?.title || '', items: participationItems.value },
  ...calloutGroups.value,
]);

const searchGroups = computed(() => {
  const fieldGroups = openCalloutId.value
    ? openCalloutGroups.value
    : props.filterGroups;

  const result = fieldGroups.map((fieldGroup, i) =>
    group(
      `search-${i}`,
      fieldItems(fieldGroup.items).filter((item) => matches(item.label)),
      fieldGroup.label
    )
  );

  if (!openCalloutId.value) {
    result.push(
      group(
        'search-callouts',
        callouts.value
          .filter((callout) => matches(callout.title))
          .map((callout) =>
            navItem(callout.title, { type: 'callout', calloutId: callout.id })
          ),
        t('contacts.dataGroup.callout-nuxt')
      )
    );
  }

  return result;
});

const browseGroups = computed(() => {
  const allFields = t('advancedSearch.allFields-nuxt');
  const calloutsLabel = t('contacts.dataGroup.callout-nuxt');
  const back = (label: string, to: PickerPath) =>
    group('back', [navItem(label, to, true)]);

  const current = path.value;
  switch (current.type) {
    case 'group': {
      const fieldGroup = props.filterGroups.find(
        (g) => g.id === current.groupId
      );
      return [
        back(allFields, { type: 'root' }),
        group('fields', fieldItems(fieldGroup?.items ?? {}), fieldGroup?.label),
      ];
    }

    case 'callouts':
      return [
        back(allFields, { type: 'root' }),
        group(
          'callouts',
          callouts.value.map((callout) =>
            navItem(callout.title, { type: 'callout', calloutId: callout.id })
          ),
          calloutsLabel
        ),
      ];

    case 'callout':
      return [
        back(calloutsLabel, { type: 'callouts' }),
        group(
          'fields',
          [
            ...fieldItems(participationItems.value),
            ...calloutGroups.value.map((calloutGroup) =>
              navItem(calloutGroup.label, {
                type: 'calloutGroup',
                calloutId: current.calloutId,
                groupId: calloutGroup.id,
              })
            ),
          ],
          openCallout.value?.title
        ),
      ];

    case 'calloutGroup': {
      const calloutGroup = calloutGroups.value.find(
        (g) => g.id === current.groupId
      );
      return [
        back(openCallout.value?.title || '', {
          type: 'callout',
          calloutId: current.calloutId,
        }),
        group(
          'fields',
          fieldItems(calloutGroup?.items ?? {}),
          calloutGroup?.label
        ),
      ];
    }

    default:
      return [
        group(
          'root',
          [
            ...props.filterGroups.map((fieldGroup) =>
              navItem(fieldGroup.label, {
                type: 'group',
                groupId: fieldGroup.id,
              })
            ),
            navItem(calloutsLabel, { type: 'callouts' }),
          ],
          allFields
        ),
      ];
  }
});

const groups = computed(() =>
  query.value.trim() ? searchGroups.value : browseGroups.value
);

function goTo(newPath: PickerPath) {
  path.value = newPath;
  query.value = '';
}

function hasNoOptions(item: FilterItem) {
  return 'options' in item && item.options?.length === 0;
}

function typeLabel(item: FilterItem) {
  if (hasNoOptions(item)) return t('advancedSearch.noOptions-nuxt');
  return t(`advancedSearch.fieldType-nuxt.${item.type}`, {
    count: 'options' in item ? (item.options?.length ?? 0) : 0,
  });
}
</script>
