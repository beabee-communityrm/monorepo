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
            :disabled="selectedCount === 0"
            @toggle="
              (tagId, successText) =>
                handleUpdateAction(
                  { tags: [tagId] }, // TODO: Callout responses only use string[] for updates
                  successText
                )
            "
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
          <font-awesome-icon :icon="faTag" class="mr-2" />
          <AppTag v-for="tag in item.tags" :key="tag.id" :tag="tag.name" />
        </div>
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  GetContactWith,
  type GetContactDataWith,
  type GetSegmentDataWith,
  type Paginated,
  type RuleGroup,
  type UpdateContactData,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import {
  faPlus,
  faDownload,
  faTag,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { addNotification } from '@store/notifications';

import PageTitle from '@components/PageTitle.vue';
import AppButtonGroup from '@components/button/AppButtonGroup.vue';
import AppButton from '@components/button/AppButton.vue';
import ToggleTagButton from '@components/tag/ToggleTagButton.vue';
import AppSearch from '@components/search/AppSearch.vue';
import AppTag from '@components/AppTag.vue';
import {
  headers,
  useContactFilters,
} from '@components/pages/admin/contacts/contacts.interface';
import AppSearchInput from '@components/forms/AppSearchInput.vue';
import SaveSegment from '@components/pages/admin/contacts/SaveSegment.vue';
import AppFilterGrid from '@components/AppFilterGrid.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '@utils/pagination';
import { fetchContacts, updateContacts } from '@utils/api/contact';
import { formatLocale } from '@utils/dates';
import { fetchSegments } from '@utils/api/segments';

import type { SelectItem } from '@components/forms/form.interface';

const { t, n } = useI18n();

const route = useRoute();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
  ])
);

const doingAction = ref(false);

const currentPaginatedQuery = definePaginatedQuery('joined');
const currentSearch = defineParam('s', (v) => v || '');
const currentRules = defineRulesParam(
  computed(() => currentSegment.value?.ruleGroup)
);
const currentSegmentId = defineParam('segment', (v) => v || '', 'replace');

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

const segments = ref<GetSegmentDataWith<'contactCount'>[]>([]);
const contactsTotal = ref<number | null>(null);
const contactsTable = ref<
  Paginated<
    GetContactDataWith<
      GetContactWith.Profile | GetContactWith.Roles | GetContactWith.Tags
    > & {
      selected: boolean;
    }
  >
>();

const selectedContactItems = computed(
  () => contactsTable.value?.items.filter((ri) => ri.selected) || []
);

const selectedCount = computed(() => selectedContactItems.value.length);

const selectedTags = computed(() => {
  const tagCount = Object.fromEntries(tagItems.value.map((t) => [t.id, 0]));

  // TODO: Add support for contact tags
  for (const item of selectedContactItems.value) {
    for (const tag of item.tags || []) {
      tagCount[tag.id]++;
    }
  }

  return Object.entries(tagCount)
    .filter((tc) => tc[1] === selectedCount.value)
    .map(([tagId]) => tagId);
});

const tagItems = ref<SelectItem<string>[]>([]); // Fake data for now
const { filterGroups /*, tagItems*/ } = useContactFilters();

const segmentItems = computed(() => [
  {
    id: '',
    label: t('contacts.allContacts'),
    count: contactsTotal.value === null ? '???' : n(contactsTotal.value),
    to: '/admin/contacts',
  },
  ...segments.value.map((segment) => ({
    id: segment.id,
    label: segment.name,
    count: n(segment.contactCount),
    to: '/admin/contacts?segment=' + segment.id,
  })),
]);

function getMembershipStartDate(
  contact: GetContactDataWith<GetContactWith.Roles>
): string {
  const membership = contact.roles.find((role) => role.role === 'member');
  return membership ? formatLocale(membership.dateAdded, 'PPP') : '';
}

function handleSavedSegment(segment: GetSegmentDataWith<'contactCount'>) {
  const segmentIndex = segments.value.findIndex((s) => s.id === segment.id);
  if (segmentIndex > -1) {
    segments.value[segmentIndex] = segment;
  } else {
    segments.value.push(segment);
  }
  currentSegmentId.value = segment.id;
}

onBeforeMount(async () => {
  contactsTotal.value = (await fetchContacts({ limit: 1 })).total;
  segments.value = await fetchSegments({ sort: 'order' }, ['contactCount']);
});

function getSearchRules(): RuleGroup {
  const searchRules: RuleGroup = {
    condition: 'OR',
    rules: currentSearch.value
      .split(' ')
      .filter((v) => !!v)
      .flatMap((value) => [
        {
          field: 'email',
          operator: 'contains',
          value: [value],
        },
        {
          field: 'firstname',
          operator: 'contains',
          value: [value],
        },
        {
          field: 'lastname',
          operator: 'contains',
          value: [value],
        },
      ]),
  };

  return currentRules.value
    ? {
        condition: 'AND',
        rules: [currentRules.value, searchRules],
      }
    : searchRules;
}

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

async function refreshResponses() {
  const query = { ...currentPaginatedQuery.query, rules: getSearchRules() };
  const newContacts = await fetchContacts(query, [
    GetContactWith.Profile,
    GetContactWith.Roles,
    GetContactWith.Tags,
  ]);
  contactsTable.value = {
    ...newContacts,
    items: newContacts.items.map((c) => ({ ...c, selected: false })),
  };
}

watchEffect(refreshResponses);

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

  await updateContacts(getSelectedContactsRules(), updates);
  await refreshResponses();

  addNotification({
    variant: 'success',
    title: successText,
  });

  doingAction.value = false;
}
</script>
