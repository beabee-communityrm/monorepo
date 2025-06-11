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
      :filter-groups="filterGroups"
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
      @saved="handleSavedSegment"
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
          <!--
          TODO:
           * Add support for emailing selected contacts (instead of all contacts)
           * This redirects to the legacy members app, we need to implement this in the new frontend
          -->
          <AppButton
            :icon="faMailBulk"
            variant="primaryOutlined"
            :title="t('actions.sendEmails')"
            :disabled="!currentSegment || selectedCount > 0"
            :href="`/members/segments/${currentSegment?.id}/email`"
            external
          />
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
  ContributionPeriod,
  type GetContactDataWith,
  GetContactWith,
  type GetSegmentDataWith,
  type Paginated,
  type RuleGroup,
  type UpdateContactData,
} from '@beabee/beabee-common';
import { AppSearchInput, AppSelect } from '@beabee/vue';
import { AppButton, AppButtonGroup } from '@beabee/vue/components';
import { addNotification } from '@beabee/vue/store/notifications';

import AppFilterGrid from '@components/AppFilterGrid.vue';
import PageTitle from '@components/PageTitle.vue';
import SaveSegment from '@components/pages/admin/contacts/SaveSegment.vue';
import {
  headers,
  useContactFilters,
} from '@components/pages/admin/contacts/contacts.interface';
import AppSearch from '@components/search/AppSearch.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import TagList from '@components/tag/TagList.vue';
import ToggleTagButton from '@components/tag/ToggleTagButton.vue';
import {
  faDownload,
  faMailBulk,
  faPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { formatLocale } from '@utils/dates';
import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '@utils/pagination';
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

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
 * Segment Management
 * @description Handles segment filtering and saving
 */
const currentSegmentId = defineParam('segment', (v) => v || '', 'replace');
const segments = ref<GetSegmentDataWith<'contactCount'>[]>([]);
const contactsTotal = ref<number | null>(null);

const currentSegment = computed(() =>
  currentSegmentId.value
    ? segments.value.find((s) => s.id === currentSegmentId.value)
    : undefined
);

const hasUnsavedSegment = computed(
  () =>
    !!route.query.r &&
    !!currentRules.value &&
    currentRules.value.rules.length > 0
);

const segmentItems = computed(() => [
  {
    id: '',
    label: t('contacts.allContacts'),
    ...(contactsTotal.value !== null && { count: contactsTotal.value }),
    to: '/admin/contacts',
  },
  ...segments.value.map((segment) => ({
    id: segment.id,
    label: segment.name,
    count: segment.contactCount,
    to: '/admin/contacts?segment=' + segment.id,
  })),
]);

/**
 * Search & Filter state
 * @description Manages search and filter parameters
 */
const currentPaginatedQuery = definePaginatedQuery('joined');
const currentSearch = defineParam('s', (v) => v || '');
const currentRules = defineRulesParam(
  computed(() => currentSegment.value?.ruleGroup)
);

const { filterGroups, tagItems } = useContactFilters();

/**
 * Action state
 */
const doingAction = ref(false);

/**
 * Lifecycle hooks
 */
onBeforeMount(async () => {
  contactsTotal.value = (await client.contact.list({ limit: 1 })).total;
  segments.value = await client.segments.list({ sort: 'order' }, [
    'contactCount',
  ]);
});

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
 * Handles segment save events
 */
function handleSavedSegment(segment: GetSegmentDataWith<'contactCount'>) {
  const segmentIndex = segments.value.findIndex((s) => s.id === segment.id);
  if (segmentIndex > -1) {
    segments.value[segmentIndex] = segment;
  } else {
    segments.value.push(segment);
  }
  currentSegmentId.value = segment.id;
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
</script>
