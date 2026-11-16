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
            @toggle-tag="
              (tagId, successText) =>
                handleUpdateAction({ tags: [tagId] }, successText)
            "
            @manage-tags="tagsModalOpen = true"
          />
        </div>

        <ContactFilterPanel
          v-if="filtersOpen"
          v-model="currentRules"
          :filter-groups="filterGroups"
          :count-matches="countMatches"
          @reset="currentRules = undefined"
          @close="filtersOpen = false"
        />

        <ContactAppliedFilters
          v-else-if="currentTag || appliedRules.length"
          v-model:rule-group="currentRules"
          :tag-label="currentTagLabel"
          :filter-groups="filterGroups"
          @remove-tag="currentTag = ''"
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

/**
 * Props & Composables
 */
const { t } = useI18n();
const toast = useAppToast();

/**
 * Table state
 * @description Manages the paginated table data
 */
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

/**
 * Tag Management
 * @description Handles tag filtering and selection state
 */
const { currentTag, addTagToRules } = useTagFilter();

const tagsModalOpen = ref(false);

const currentTagLabel = computed(
  () => tagItems.value.find((tag) => tag.id === currentTag.value)?.label
);

/**
 * Search & Filter state
 * @description Manages search and filter parameters
 */
const currentPaginatedQuery = definePaginatedQuery('joined');
const currentSearch = defineParam('s', (v) => v || '');

const { filterGroups, tagItems, refreshTags } = useContactFilters();

const filtersOpen = ref(false);

const appliedRules = computed(() => currentRules.value?.rules ?? []);

const filtersOn = computed(
  () => filtersOpen.value || appliedRules.value.length > 0
);

async function countMatches(rules: RuleGroup) {
  return (await client.contact.list({ limit: 1, rules: getSearchRules(rules) }))
    .total;
}

/**
 * Segment Management
 * @description Handles segment filtering and saving
 */
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

async function saveSegment(name: string, rules: RuleGroup) {
  const segment = await client.segments.create({
    name,
    ruleGroup: rules,
  });
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
 * Action state
 */
const doingAction = ref(false);

/**
 * Lifecycle hooks
 */
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
 * Helper Functions
 */

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
 * Gets rules for selected contacts
 */
function getSelectedContactsRules(): RuleGroup {
  return {
    condition: 'AND',
    rules: [getSelectionRules(), getSearchRules()],
  };
}

/**
 * Action Handlers
 */

/**
 * Table state
 */
const isRefreshing = ref(false);

/**
 * Refreshes the contact list based on current filters
 */
async function refreshResponses() {
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
  () => refreshResponses(),
  { deep: true }
);
refreshResponses();

/**
 * Handles exporting contacts
 */
function handleExport() {
  const rules = getSearchRules();
  const rulesQuery = encodeURIComponent(JSON.stringify(rules));
  window.open(`/api/1.0/contact.csv?rules=${rulesQuery}`, '_blank');
}

/**
 * Handles contact update actions
 */
async function handleUpdateAction(
  updates: UpdateContactData,
  successText: string
): Promise<void> {
  doingAction.value = true;
  try {
    await client.contact.updateMany(getSelectedContactsRules(), updates);
    await refreshResponses();
    toast.success(successText);
  } catch {
    toast.error(t('tags.notifications.updateFailed-nuxt'));
  } finally {
    doingAction.value = false;
  }
}
</script>
