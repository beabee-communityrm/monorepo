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

import type { DropdownMenuItem } from '@nuxt/ui';

import { computed, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ContactAppliedFilters from '#components/pages/admin/contacts/ContactAppliedFilters.vue';
import ContactFilterPanel from '#components/pages/admin/contacts/ContactFilterPanel.vue';
import ContactTagsModal from '#components/pages/admin/contacts/ContactTagsModal.vue';
import ContactsTable from '#components/pages/admin/contacts/ContactsTable.vue';
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
