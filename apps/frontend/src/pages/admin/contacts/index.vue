<route lang="yaml">
name: adminContacts
meta:
  pageTitle: menu.contacts
  role: admin
  fullBleed: true
</route>

<template>
  <div class="nuxt-page flex flex-1 flex-col">
    <Teleport to="#page-header-actions" defer>
      <UButton icon="i-lucide-plus" to="/admin/contacts/add">
        {{ t('contacts.addContact') }}
      </UButton>
    </Teleport>

    <div class="flex flex-1 flex-col md:flex-row">
      <ContactsSegmentFilter
        :segments="segmentItems"
        :current-segment-id="currentSegmentId"
      />

      <div class="flex min-w-0 flex-1 flex-col bg-default">
        <div
          class="flex flex-wrap items-center gap-3 border-b border-default p-4"
        >
          <AppSearchBox
            v-model="currentSearch"
            :placeholder="t('contacts.search')"
            class="w-full sm:w-64"
          />

          <ContactsTagFilter
            v-model="currentTag"
            :tag-items="tagItems"
            @manage-tags="tagsModalOpen = true"
          />

          <UButton
            icon="i-lucide-filter"
            :trailing-icon="
              filtersOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
            "
            :color="filtersOn ? 'primary' : 'neutral'"
            variant="subtle"
            :aria-expanded="filtersOpen"
            @click="filtersOpen = !filtersOpen"
          >
            {{ t('advancedSearch.button') }}
            <UBadge v-if="appliedRules.length" size="sm">
              {{ appliedRules.length }}
            </UBadge>
          </UButton>

          <ContactsActions
            class="ml-auto"
            :selected-count="selectedCount"
            :selected-page-items="selectedPageItems"
            :tag-items="tagItems"
            :current-segment="currentSegment"
            :busy="doingAction"
            @export="handleExport"
            @toggle-tag="handleToggleTag"
            @manage-tags="tagsModalOpen = true"
          />

          <span v-if="contactsTable" class="whitespace-nowrap text-muted">
            <i18n-t keypath="contacts.showingOf-nuxt">
              <template #start>
                <b class="font-medium text-highlighted">
                  {{ n(contactsTable.offset + 1) }}
                </b>
              </template>
              <template #end>
                <b class="font-medium text-highlighted">
                  {{ n(contactsTable.offset + contactsTable.count) }}
                </b>
              </template>
              <template #total>
                <b class="font-medium text-highlighted">
                  {{ n(contactsTable.total) }}
                </b>
              </template>
            </i18n-t>
          </span>
        </div>

        <ContactFilterPanel
          v-if="filtersOpen"
          v-model="currentRules"
          :filter-groups="filterGroups"
          :match-count="matchCount"
          @change="handleDraftChange"
          @reset="handleResetFilters"
          @close="filtersOpen = false"
        />

        <ContactAppliedFilters
          v-else-if="currentTag || appliedRules.length"
          :tag-label="currentTagLabel"
          :rule-group="currentRules"
          :filter-groups="filterGroups"
          @remove-tag="currentTag = ''"
          @remove-rule="handleRemoveRule"
        >
          <SaveSegment
            v-if="hasUnsavedSegment && currentRules"
            :segment="currentSegment"
            :rules="currentRules"
            :save-segment="saveSegment"
            :update-segment="updateSegment"
          />
        </ContactAppliedFilters>

        <ContactsTable
          v-model:sort="currentPaginatedQuery.sort"
          v-model:page="currentPaginatedQuery.page"
          v-model:limit="currentPaginatedQuery.limit"
          v-model:selection-state="selectionState"
          :contacts="contactsTable?.items"
          :total="contactsTable?.total ?? 0"
          :empty-text="
            currentRules || currentSearch
              ? t('contacts.noResults')
              : t('contacts.noContacts')
          "
          @select-tag="currentTag = $event"
        />
      </div>
    </div>

    <ContactTagsModal v-model:open="tagsModalOpen" @updated="refreshTags" />
  </div>
</template>

<script lang="ts" setup>
import {
  type GetContactDataWith,
  GetContactWith,
  type Paginated,
  type RuleGroup,
  type UpdateContactData,
} from '@beabee/beabee-common';

import { AppSearchBox } from '@beabee/vue';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactAppliedFilters from '#components/pages/admin/contacts/ContactAppliedFilters.vue';
import ContactFilterPanel from '#components/pages/admin/contacts/ContactFilterPanel.vue';
import ContactsActions from '#components/pages/admin/contacts/ContactsActions.vue';
import ContactTagsModal from '#components/pages/admin/contacts/ContactTagsModal.vue';
import ContactsTable from '#components/pages/admin/contacts/ContactsTable.vue';
import ContactsTagFilter from '#components/pages/admin/contacts/ContactsTagFilter.vue';
import ContactsSegmentFilter from '#components/pages/admin/contacts/ContactsSegmentFilter.vue';
import SaveSegment from '#components/pages/admin/contacts/SaveSegment.vue';
import { useContactFilters } from '#components/pages/admin/contacts/contacts.interface';
import { useAppToast } from '#composables/useAppToast';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';
import { definePaginatedQuery, defineParam } from '#utils/pagination';
import { routeIcons, routeLabels } from '#utils/route-nav';

import { useSegmentManagement } from '../../../composables/useSegmentManagement';
import { usePaginatedSelectionState } from '../../../composables/useSelectionState';
import { useTagFilter } from '../../../composables/useTagFilter';

/**
 * Contact list page component
 * Provides functionality for:
 * - Viewing and filtering contacts
 * - Managing contact tags
 * - Exporting contacts
 * - Saving contact segments
 */

const { t, n } = useI18n();
const toast = useAppToast();

const contactsTable =
  ref<
    Paginated<
      GetContactDataWith<
        GetContactWith.Profile | GetContactWith.Roles | GetContactWith.Tags
      >
    >
  >();

const { selectionState, selectedPageItems, selectedCount, getSelectionRules } =
  usePaginatedSelectionState(contactsTable);

const { currentTag, addTagToRules } = useTagFilter();

const currentPaginatedQuery = definePaginatedQuery('joined');
const currentSearch = defineParam('s', (v) => v || '');

const { filterGroups, tagItems, refreshTags } = useContactFilters();

const filtersOpen = ref(false);
const tagsModalOpen = ref(false);
const doingAction = ref(false);

const {
  currentSegmentId,
  currentSegment,
  currentRules,
  hasUnsavedSegment,
  emptyTable,
  segmentItems,
  handleSavedSegment,
} = useSegmentManagement(
  '/admin/contacts',
  t('contacts.allContacts'),
  listSegments,
  listTotalSegmentItems
);

addBreadcrumb(
  computed(() => [
    {
      label: t(routeLabels.adminContacts),
      to: '/admin/contacts',
      icon: routeIcons.adminContacts,
    },
  ])
);

/**
 * Segments
 */
async function saveSegment(name: string, rules: RuleGroup) {
  const segment = await client.segments.create({ name, ruleGroup: rules });
  handleSavedSegment(segment);
  return segment;
}

async function updateSegment(
  segmentId: string,
  name: string,
  rules: RuleGroup
) {
  const segment = await client.segments.update(segmentId, {
    name,
    ruleGroup: rules,
  });
  handleSavedSegment(segment);
  return segment;
}

async function listSegments() {
  return await client.segments.list({ sort: 'order', limit: 100 }, [
    'itemCount',
  ]);
}

async function listTotalSegmentItems() {
  return (await client.contact.list({ limit: 1 })).total;
}

/**
 * Filters
 */
const appliedRules = computed(() => currentRules.value?.rules ?? []);

const filtersOn = computed(
  () => filtersOpen.value || appliedRules.value.length > 0
);

/** Keeps an empty group rather than none, which would bring back the segment's rules */
function handleRemoveRule(index: number) {
  currentRules.value = {
    condition: currentRules.value?.condition ?? 'AND',
    rules: appliedRules.value.filter((_, i) => i !== index),
  };
}

function handleResetFilters() {
  currentRules.value = undefined;
  matchCount.value = undefined;
}

/**
 * Builds the search rules for the given filter rules
 */
function getSearchRules(ruleGroup = currentRules.value): RuleGroup {
  const searchRules: RuleGroup = {
    condition: 'OR',
    rules: currentSearch.value
      .split(' ')
      .filter((v) => !!v)
      .flatMap((value) => [
        { field: 'email', operator: 'contains', value: [value] },
        { field: 'firstname', operator: 'contains', value: [value] },
        { field: 'lastname', operator: 'contains', value: [value] },
      ]),
  };

  const rules: RuleGroup[] = [];
  if (currentSearch.value) rules.push(searchRules);
  if (ruleGroup) rules.push(ruleGroup);

  return addTagToRules(rules, currentTag.value);
}

/**
 * Live count of the contacts the unapplied filters match
 */
const matchCount = ref<number>();
let matchCountTimer: ReturnType<typeof setTimeout>;

function handleDraftChange(ruleGroup: RuleGroup) {
  clearTimeout(matchCountTimer);
  matchCountTimer = setTimeout(async () => {
    try {
      const result = await client.contact.list({
        limit: 1,
        rules: getSearchRules(ruleGroup.rules.length ? ruleGroup : undefined),
      });
      matchCount.value = result.total;
    } catch {
      matchCount.value = undefined;
    }
  }, 400);
}

/**
 * Tags
 */
const currentTagLabel = computed(
  () => tagItems.value.find((tag) => tag.id === currentTag.value)?.label
);

function handleToggleTag(
  tag: { id: string; label: string },
  isTagged: boolean
) {
  return handleUpdateAction(
    { tags: [(isTagged ? '-' : '+') + tag.id] },
    t(
      isTagged
        ? 'tags.notifications.removedTag'
        : 'tags.notifications.addedTag',
      { tag: tag.label }
    )
  );
}

/**
 * Actions
 */
function getSelectedContactsRules(): RuleGroup {
  return {
    condition: 'AND',
    rules: [getSelectionRules(), getSearchRules()],
  };
}

function handleExport() {
  const rules = getSearchRules();
  const rulesQuery = encodeURIComponent(JSON.stringify(rules));
  window.open(`/api/1.0/contact.csv?rules=${rulesQuery}`, '_blank');
}

async function handleUpdateAction(
  updates: UpdateContactData,
  successText: string
): Promise<void> {
  doingAction.value = true;
  try {
    await client.contact.updateMany(getSelectedContactsRules(), updates);
    await refreshContacts();
    toast.success(successText);
  } catch {
    toast.error(t('tags.notifications.updateFailed-nuxt'));
  } finally {
    doingAction.value = false;
  }
}

/**
 * Data loading
 */
const isRefreshing = ref(false);

async function refreshContacts() {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    const query = { ...currentPaginatedQuery.query, rules: getSearchRules() };
    contactsTable.value = await client.contact.list(query, [
      GetContactWith.Profile,
      GetContactWith.Roles,
      GetContactWith.Tags,
    ]);
  } catch (err) {
    contactsTable.value = emptyTable();
    toast.error(extractErrorText(err));
  } finally {
    isRefreshing.value = false;
  }
}

watch(
  [currentPaginatedQuery, currentSearch, currentRules, currentTag],
  () => refreshContacts(),
  { deep: true }
);
refreshContacts();
</script>
