<route lang="yaml">
name: adminContacts
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <PageTitle :title="t('menu.contacts')" border>
    <div class="flex-0 ml-3 hidden md:block">
      <AppButton to="/admin/contacts/add">
        {{ t('contacts.addContact') }}
      </AppButton>
    </div>
    <div class="fixed bottom-5 right-5 md:hidden">
      <AppButton
        :icon="faPlus"
        :title="t('contacts.addContact')"
        class="rounded-full drop-shadow-md"
        size="lg"
        to="/admin/contacts/add"
      />
    </div>
  </PageTitle>
  <AppFilterGrid v-model="currentSegmentId" :items="segmentItems">
    <AppSearch
      v-model="currentRules"
      :filter-groups="filteredGroups"
      :has-changed="hasUnsavedSegment"
      @reset="currentRules = undefined"
    >
      <AppSearchInput
        v-model="currentSearch"
        :placeholder="t('contacts.search')"
      />
      <AppSelect
        v-model="currentTag"
        :placeholder="t('tags.searchTag')"
        :items="tagItems"
      />
    </AppSearch>
    <SaveSegment
      v-if="hasUnsavedSegment && currentRules"
      :segment="currentSegment"
      :rules="currentRules"
      :save-segment="saveSegment"
      :update-segment="updateSegment"
    />
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      keypath="contacts.showingOf"
      :headers="headers"
      :result="contactsTable"
      selectable
    >
      <template #actions>
        <AppButtonGroup>
          <!-- TODO: Add support for exporting selected contacts (instead of all contacts) -->
          <AppButton
            :icon="faDownload"
            variant="primaryOutlined"
            :title="t('actions.export')"
            :disabled="selectedCount > 0"
            @click="handleExport"
          />
          <ToggleTagButton
            :tag-items="tagItems"
            :selected-tags="selectedTags"
            :manage-url="`${route.path}/tags`"
            :loading="doingAction"
            :disable-tags="selectedCount === 0"
            @toggle="
              (tagId, successText) =>
                handleUpdateAction({ tags: [tagId] }, successText)
            "
          />
          <AppDropdownButton
            :icon="faMailBulk"
            variant="primaryOutlined"
            :title="t('actions.sendEmails')"
            :disabled="!currentSegment || selectedCount > 0"
          >
            <router-link
              v-if="currentSegment"
              class="block px-3 py-2 hover:bg-primary-5"
              role="menuitem"
              :to="`/admin/contacts/send-email/${currentSegment.id}`"
              @click.stop
            >
              {{ t('actions.sendOneOffEmail') }}
            </router-link>
            <a
              v-if="currentSegment"
              class="block border-t border-primary-40 px-3 py-2 hover:bg-primary-5"
              :href="`/members/segments/${currentSegment.id}/email`"
              role="menuitem"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
            >
              {{ t('actions.sendOngoingEmails') }}
            </a>
          </AppDropdownButton>
        </AppButtonGroup>
        <p v-if="selectedCount > 0" class="self-center text-sm">
          <i18n-t keypath="contacts.selectedCount" :plural="selectedCount">
            <template #n>
              <b>{{ selectedCount }}</b>
            </template>
          </i18n-t>
        </p>
      </template>
      <template #empty>
        <p>
          {{
            currentRules || currentSearch
              ? t('contacts.noResults')
              : t('contacts.noContacts')
          }}
        </p>
      </template>
      <template #value-firstname="{ item }">
        <router-link
          :to="'/admin/contacts/' + item.id"
          class="text-base font-bold text-link"
        >
          {{ item.displayName }}
        </router-link>
      </template>
      <template #value-contributionMonthlyAmount="{ item }">
        <span v-if="item.contributionAmount" class="whitespace-nowrap">
          {{ n(item.contributionAmount, 'currency') }}
          {{
            item.contributionPeriod === ContributionPeriod.Monthly
              ? t('common.perMonth')
              : t('common.perYear')
          }}
        </span>
      </template>
      <template #value-joined="{ value }">
        <span class="whitespace-nowrap">{{ formatLocale(value, 'PPP') }}</span>
      </template>
      <template #value-membershipStarts="{ item }">
        <span class="whitespace-nowrap">{{
          getMembershipStartDate(item)
        }}</span>
      </template>
      <template
        #after="{
          item,
        }: {
          item: GetContactDataWith<
            GetContactWith.Profile | GetContactWith.Tags
          >;
        }"
      >
        <p v-if="item.profile.description" class="whitespace-normal text-xs">
          {{ item.profile.description }}
        </p>
        <div
          v-if="item.tags && item.tags.length > 0"
          :class="item.profile.description && 'mt-2'"
        >
          <TagList :tags="item.tags" @select="currentTag = $event" />
        </div>
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import {
  type ContentJoinData,
  ContributionPeriod,
  type GetContactDataWith,
  GetContactWith,
  type Paginated,
  type RuleGroup,
  type UpdateContactData,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppButtonGroup,
  AppDropdownButton,
  AppFilterGrid,
  AppSearchInput,
  AppSelect,
  PageTitle,
  addNotification,
  formatLocale,
} from '@beabee/vue';

import {
  faDownload,
  faMailBulk,
  faPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import SaveSegment from '#components/pages/admin/contacts/SaveSegment.vue';
import {
  headers,
  useContactFilters,
} from '#components/pages/admin/contacts/contacts.interface';
import AppSearch from '#components/search/AppSearch.vue';
import TagList from '#components/tag/TagList.vue';
import ToggleTagButton from '#components/tag/ToggleTagButton.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { definePaginatedQuery, defineParam } from '#utils/pagination';

import AppPaginatedTable from '../../../components/table/AppPaginatedTable.vue';
import { useSegmentManagement } from '../../../composables/useSegmentManagement';
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
const { t, n } = useI18n();
const route = useRoute();

/**
 * Table state
 * @description Manages the paginated table data and selection state
 */
const contactsTable =
  ref<
    Paginated<
      GetContactDataWith<
        GetContactWith.Profile | GetContactWith.Roles | GetContactWith.Tags
      > & { selected: boolean }
    >
  >();

const selectedContactItems = computed(
  () => contactsTable.value?.items.filter((ri) => ri.selected) || []
);
const selectedCount = computed(() => selectedContactItems.value.length);

/**
 * Tag Management
 * @description Handles tag filtering and selection state
 */
const { currentTag, addTagToRules } = useTagFilter();

const selectedTags = computed(() => {
  if (selectedCount.value === 0) {
    return [];
  }

  const tagCount = Object.fromEntries(tagItems.value.map((t) => [t.id, 0]));
  for (const item of selectedContactItems.value) {
    for (const tag of item.tags || []) {
      tagCount[tag.id]++;
    }
  }
  return Object.entries(tagCount)
    .filter((tc) => tc[1] === selectedCount.value)
    .map(([tagId]) => tagId);
});

/**
 * Handle settings for one-time contribution
 */
const joinContent = ref<ContentJoinData>();
const hasOneTimeContribution = computed(() =>
  joinContent.value?.periods.some((p) => p.name === 'one-time')
);
const filteredGroups = computed(() => {
  return filterGroups.value.filter(
    (group) =>
      hasOneTimeContribution.value || group.id !== 'oneTimeContributions'
  );
});

/**
 * Segment Management
 * @description Handles segment filtering and saving
 */
const {
  currentSegmentId,
  currentSegment,
  currentRules,
  hasUnsavedSegment,
  hasInvalidRules,
  emptyTable,
  segmentItems,
  handleSavedSegment,
} = useSegmentManagement(
  '/admin/contacts',
  'All Contacts',
  listSegments,
  listTotalSegmentItems,
  filteredGroups.value //TODO: replace with filterGroups after merge of #472
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
  return await client.segments.list({ sort: 'order' }, ['itemCount']);
}

async function listTotalSegmentItems() {
  return (await client.contact.list({ limit: 1 })).total;
}

/**
 * Search & Filter state
 * @description Manages search and filter parameters
 */
const currentPaginatedQuery = definePaginatedQuery('joined');
const currentSearch = defineParam('s', (v) => v || '');

const { filterGroups, tagItems } = useContactFilters();

/**
 * Action state
 */
const doingAction = ref(false);

/**
 * Lifecycle hooks
 */
addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
  ])
);

/**
 * Helper Functions
 */

/**
 * Gets the membership start date for a contact
 */
function getMembershipStartDate(
  contact: GetContactDataWith<GetContactWith.Roles>
): string {
  const membership = contact.roles.find((role) => role.role === 'member');
  return membership ? formatLocale(membership.dateAdded, 'PPP') : '';
}

/**
 * Builds the search rules for the current filter state
 */
function getSearchRules(): RuleGroup {
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
  if (currentRules.value) rules.push(currentRules.value);

  return addTagToRules(rules, currentTag.value);
}

/**
 * Gets rules for selected contacts
 */
function getSelectedContactsRules(): RuleGroup {
  return {
    condition: 'OR',
    rules: selectedContactItems.value.map((item) => ({
      field: 'id',
      operator: 'equal',
      value: [item.id],
    })),
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
  if (hasInvalidRules.value) {
    contactsTable.value = emptyTable();
    return;
  }

  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    // Store currently selected IDs before refresh
    const selectedIds = new Set(
      selectedContactItems.value.map((item) => item.id)
    );

    const query = { ...currentPaginatedQuery.query, rules: getSearchRules() };
    const newContacts = await client.contact.list(query, [
      GetContactWith.Profile,
      GetContactWith.Roles,
      GetContactWith.Tags,
    ]);

    // Preserve selection state for existing contacts
    contactsTable.value = {
      ...newContacts,
      items: newContacts.items.map((c) => ({
        ...c,
        selected: selectedIds.has(c.id),
      })),
    };
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
  await client.contact.updateMany(getSelectedContactsRules(), updates);
  await refreshResponses();
  addNotification({ variant: 'success', title: successText });
  doingAction.value = false;
}

onBeforeMount(async () => {
  joinContent.value = await client.content.get('join');
});
</script>
