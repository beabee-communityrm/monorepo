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
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            variant="subtle"
            class="w-full sm:w-64"
            :placeholder="t('contacts.search')"
            @keyup.enter="currentSearch = searchInput"
            @blur="currentSearch = searchInput"
          >
            <template v-if="searchInput" #trailing>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="link"
                size="sm"
                :aria-label="t('actions.clearSearch')"
                @click="clearSearch"
              />
            </template>
          </UInput>

          <UDropdownMenu :items="tagFilterItems">
            <UButton
              icon="i-lucide-tag"
              trailing-icon="i-lucide-chevron-down"
              :color="currentTag ? 'primary' : 'neutral'"
              variant="subtle"
            >
              {{ currentTagLabel }}
            </UButton>
          </UDropdownMenu>

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

          <div class="ml-auto flex items-center gap-1">
            <!-- TODO: Add support for exporting selected contacts (instead of all contacts) -->
            <UButton
              icon="i-lucide-download"
              color="neutral"
              variant="ghost"
              :title="t('actions.export')"
              :aria-label="t('actions.export')"
              :disabled="selectedCount > 0"
              @click="handleExport"
            />

            <!-- TODO: Add support for emailing selected contacts (instead of all contacts) -->
            <UDropdownMenu :items="emailItems">
              <UButton
                icon="i-lucide-mail"
                color="neutral"
                variant="ghost"
                :title="t('actions.sendEmails')"
                :aria-label="t('actions.sendEmails')"
                :aria-describedby="emailUnavailableReason && emailReasonId"
              />
            </UDropdownMenu>
            <span
              v-if="emailUnavailableReason"
              :id="emailReasonId"
              class="sr-only"
            >
              {{ emailUnavailableReason }}
            </span>

            <UDropdownMenu
              :items="bulkTagItems"
              :disabled="selectedCount === 0"
            >
              <UButton
                icon="i-lucide-tag"
                color="neutral"
                variant="ghost"
                :disabled="selectedCount === 0"
                :title="
                  selectedCount > 0
                    ? t('tags.toggleTag')
                    : t('tags.selectToTag-nuxt')
                "
                :aria-label="t('tags.toggleTag')"
                :loading="doingAction"
              />

              <template #item-trailing="{ item }">
                <span v-if="item.count" class="text-muted">
                  {{ item.count }}
                </span>
              </template>
            </UDropdownMenu>
          </div>

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
          :tag-label="currentTag ? currentTagLabel : undefined"
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

        <AppSelectAllBanner
          v-if="showSelectAllBanner"
          :mode="selectionState.mode"
          :selected-count="selectedCount"
          :total="contactsTable?.total ?? 0"
          key-prefix="contacts.selectAllBanner-nuxt"
          @select-all="selectAllMatching"
          @clear="clearSelection"
        />

        <div class="flex-1 overflow-x-auto bg-muted">
          <table class="w-full bg-default">
            <thead>
              <tr class="border-b border-default bg-elevated/50">
                <th class="w-10 px-3 py-3">
                  <UCheckbox
                    :model-value="headerCheckboxValue"
                    :aria-label="t('common.selectAll')"
                    @update:model-value="toggleAllOnPage"
                  />
                </th>
                <th
                  v-for="column in columns"
                  :key="column.key"
                  class="px-3 py-2 text-left font-medium whitespace-nowrap"
                  :class="column.wide && 'w-full'"
                >
                  <UButton
                    color="neutral"
                    variant="ghost"
                    class="-mx-2"
                    :class="
                      currentPaginatedQuery.sort.by === column.key
                        ? 'text-highlighted'
                        : 'text-muted'
                    "
                    :trailing-icon="sortIcon(column.key)"
                    @click="sortBy(column.key)"
                  >
                    {{ column.label }}
                  </UButton>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default border-b border-default">
              <tr
                v-for="contact in contactsTable?.items"
                :key="contact.id"
                :class="isSelected(contact.id) && 'bg-primary/5'"
              >
                <td class="px-3 py-3 align-top">
                  <UCheckbox
                    :model-value="isSelected(contact.id)"
                    :aria-label="contact.displayName"
                    @update:model-value="
                      (checked: boolean | 'indeterminate') =>
                        setSelected(contact.id, checked === true)
                    "
                  />
                </td>
                <td class="px-3 py-3 align-top">
                  <router-link
                    :to="`/admin/contacts/${contact.id}`"
                    class="font-medium text-primary hover:underline"
                  >
                    {{ contact.displayName }}
                  </router-link>
                  <p v-if="contact.profile.description" class="mt-1 text-muted">
                    {{ contact.profile.description }}
                  </p>
                  <div
                    v-if="contact.tags?.length"
                    class="mt-1 flex flex-wrap gap-1"
                  >
                    <UBadge
                      v-for="tag in contact.tags"
                      :key="tag.id"
                      as="button"
                      type="button"
                      color="neutral"
                      variant="subtle"
                      class="cursor-pointer"
                      @click="currentTag = tag.id"
                    >
                      {{ tag.name }}
                    </UBadge>
                  </div>
                </td>
                <td class="px-3 py-3 align-top text-muted">
                  {{ contact.email }}
                </td>
                <td class="px-3 py-3 align-top">
                  <UBadge
                    v-if="contact.contributionAmount"
                    color="primary"
                    variant="subtle"
                    class="whitespace-nowrap"
                  >
                    {{ n(contact.contributionAmount, 'currency') }}
                    {{
                      contact.contributionPeriod === ContributionPeriod.Monthly
                        ? t('common.perMonth')
                        : t('common.perYear')
                    }}
                  </UBadge>
                  <span v-else class="text-dimmed">—</span>
                </td>
                <td
                  class="px-3 py-3 align-top whitespace-nowrap text-muted tabular-nums"
                >
                  {{ formatLocale(contact.joined, 'PPP') }}
                </td>
                <td
                  class="px-3 py-3 align-top whitespace-nowrap text-muted tabular-nums"
                >
                  {{ getMembershipStartDate(contact) }}
                </td>
              </tr>
            </tbody>
          </table>

          <p v-if="!contactsTable" class="p-8 text-center text-muted">
            {{ t('common.loading') }}
          </p>
          <p
            v-else-if="contactsTable.items.length === 0"
            class="p-8 text-center text-muted"
          >
            {{
              currentRules || currentSearch
                ? t('contacts.noResults')
                : t('contacts.noContacts')
            }}
          </p>
        </div>

        <AppTablePagination
          v-model:page="currentPaginatedQuery.page"
          v-model:limit="currentPaginatedQuery.limit"
          :total="contactsTable?.total ?? 0"
          class="sticky bottom-0 z-10 -mt-px bg-default"
        />
      </div>
    </div>

    <ContactTagsModal v-model:open="tagsModalOpen" @updated="refreshTags" />
  </div>
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  type GetContactDataWith,
  GetContactWith,
  type Paginated,
  type RuleGroup,
  type UpdateContactData,
} from '@beabee/beabee-common';
import {
  AppSelectAllBanner,
  AppTablePagination,
  SortType,
  formatLocale,
} from '@beabee/vue';

import type { DropdownMenuItem } from '@nuxt/ui';

import { computed, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactAppliedFilters from '#components/pages/admin/contacts/ContactAppliedFilters.vue';
import ContactFilterPanel from '#components/pages/admin/contacts/ContactFilterPanel.vue';
import ContactTagsModal from '#components/pages/admin/contacts/ContactTagsModal.vue';
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

const {
  selectionState,
  selectedPageItems,
  selectedCount,
  allOnPageSelected,
  someOnPageSelected,
  isSelected,
  setSelected,
  toggleAllOnPage,
  selectAllMatching,
  clearSelection,
  getSelectionRules,
} = usePaginatedSelectionState(contactsTable);

const { currentTag, addTagToRules } = useTagFilter();

const currentPaginatedQuery = definePaginatedQuery('joined');
const currentSearch = defineParam('s', (v) => v || '');
const searchInput = ref(currentSearch.value);

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
 * Table
 */
const columns = computed(() => [
  { key: 'firstname', label: t('contacts.data.name'), wide: true },
  { key: 'email', label: t('contacts.data.email') },
  { key: 'contributionMonthlyAmount', label: t('contacts.data.contribution') },
  { key: 'joined', label: t('contacts.data.joined') },
  { key: 'membershipStarts', label: t('contacts.data.membershipStarts') },
]);

const headerCheckboxValue = computed<boolean | 'indeterminate'>(() =>
  allOnPageSelected.value
    ? true
    : someOnPageSelected.value
      ? 'indeterminate'
      : false
);

const showSelectAllBanner = computed(() => {
  if (selectionState.value.mode === 'all') return selectedCount.value > 0;

  return (
    allOnPageSelected.value &&
    (contactsTable.value?.total ?? 0) > (contactsTable.value?.count ?? 0)
  );
});

function sortIcon(key: string) {
  if (currentPaginatedQuery.sort.by !== key) return 'i-lucide-chevrons-up-down';
  return currentPaginatedQuery.sort.type === SortType.Asc
    ? 'i-lucide-chevron-up'
    : 'i-lucide-chevron-down';
}

function sortBy(key: string) {
  const { by, type } = currentPaginatedQuery.sort;
  currentPaginatedQuery.sort = {
    by: key,
    type: by === key && type === SortType.Asc ? SortType.Desc : SortType.Asc,
  };
}

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
 * Filters
 */
const appliedRules = computed(() => currentRules.value?.rules ?? []);

const filtersOn = computed(
  () => filtersOpen.value || appliedRules.value.length > 0
);

function clearSearch() {
  searchInput.value = '';
  currentSearch.value = '';
}

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
  () =>
    tagItems.value.find((tag) => tag.id === currentTag.value)?.label ||
    t('tags.searchTag')
);

const tagFilterItems = computed<DropdownMenuItem[][]>(() => [
  [
    ...(tagItems.value.length
      ? tagItems.value.map((tag) => ({
          type: 'checkbox' as const,
          label: tag.label,
          checked: currentTag.value === tag.id,
          onUpdateChecked: (checked: boolean) => {
            currentTag.value = checked ? tag.id : '';
          },
        }))
      : [{ label: t('tags.noTags'), disabled: true }]),
    ...(currentTag.value
      ? [
          {
            label: t('tags.clearTags-nuxt'),
            color: 'primary' as const,
            class:
              'data-highlighted:before:bg-transparent data-highlighted:underline',
            onSelect: () => (currentTag.value = ''),
          },
        ]
      : []),
  ],
  [
    {
      label: t('tags.manageTags'),
      icon: 'i-lucide-settings',
      onSelect: () => (tagsModalOpen.value = true),
    },
  ],
]);

const bulkTagItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label' as const,
      label: t(
        'tags.tagSelected-nuxt',
        { count: n(selectedCount.value) },
        selectedCount.value
      ),
    },
  ],
  tagItems.value.length
    ? tagItems.value.map((tag) => {
        const taggedCount = selectedPageItems.value.filter((contact) =>
          contact.tags?.some((contactTag) => contactTag.id === tag.id)
        ).length;
        const checked =
          taggedCount > 0 && taggedCount === selectedPageItems.value.length;

        return {
          type: 'checkbox' as const,
          label: tag.label,
          checked,
          count: t('tags.countOfSelected-nuxt', {
            count: n(taggedCount),
            total: n(selectedPageItems.value.length),
          }),
          // Keep the menu open so several tags can be toggled in a row
          onSelect: (event: Event) => event.preventDefault(),
          onUpdateChecked: () => handleToggleTag(tag, checked),
        };
      })
    : [{ label: t('tags.noTags'), disabled: true }],
  [
    {
      label: t('tags.manageTags'),
      icon: 'i-lucide-settings',
      onSelect: () => (tagsModalOpen.value = true),
    },
  ],
]);

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
 * Emails
 */
const emailReasonId = useId();

/** Why a one-off email can't be sent right now, if it can't */
const emailUnavailableReason = computed(() => {
  if (!currentSegment.value) return t('contacts.sendEmailNoSegment-nuxt');
  if (selectedCount.value > 0) return t('contacts.sendEmailSelection-nuxt');
  return undefined;
});

const emailItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t('actions.sendOneOffEmail-nuxt'),
      icon: 'i-lucide-send',
      ...(currentSegment.value && !emailUnavailableReason.value
        ? { to: `/admin/contacts/send-email/${currentSegment.value.id}` }
        : { disabled: true, description: emailUnavailableReason.value }),
    },
  ],
  [
    {
      label: t('contacts.emailTemplates.manage'),
      icon: 'i-lucide-settings',
      to: { name: 'adminContactsEmailTemplates' },
    },
  ],
]);

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
watch(currentSearch, (value) => (searchInput.value = value));
refreshContacts();
</script>
