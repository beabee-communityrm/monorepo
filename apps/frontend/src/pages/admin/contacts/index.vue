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
      :headers="headers"
      :result="contactsTable"
      keypath="contacts.showingOf"
    >
      <template #actions>
        <AppButton
          :icon="faDownload"
          variant="primaryOutlined"
          :title="t('actions.export')"
          @click="handleExport"
        />
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
      <template #after="{ item }">
        <p v-if="item.profile.description" class="whitespace-normal text-xs">
          {{ item.profile.description }}
        </p>
        <div
          v-if="item.profile.tags && item.profile.tags.length > 0"
          :class="item.profile.description && 'mt-2'"
        >
          <font-awesome-icon :icon="faTag" class="mr-2" />
          <AppTag v-for="tag in item.profile.tags" :key="tag" :tag="tag" />
        </div>
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  type Paginated,
  type RuleGroup,
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

import PageTitle from '@components/PageTitle.vue';
import AppButton from '@components/button/AppButton.vue';
import AppSearch from '@components/search/AppSearch.vue';
import AppTag from '@components/AppTag.vue';
import {
  headers,
  filterGroups,
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
import { fetchContacts } from '@utils/api/contact';
import { formatLocale } from '@utils/dates';
import { fetchSegments } from '@utils/api/segments';

import type { GetContactDataWith, GetSegmentDataWith } from '@type';

const { t, n } = useI18n();

const route = useRoute();

addBreadcrumb(
  computed(() => [
    { title: t('menu.contacts'), to: '/admin/contacts', icon: faUsers },
  ])
);

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
const contactsTable = ref<Paginated<GetContactDataWith<'profile' | 'roles'>>>();

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

function getMembershipStartDate(contact: GetContactDataWith<'roles'>): string {
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

watchEffect(async () => {
  const query = { ...currentPaginatedQuery.query, rules: getSearchRules() };
  contactsTable.value = await fetchContacts(query, ['profile', 'roles']);
});

function handleExport() {
  const rules = getSearchRules();
  const rulesQuery = encodeURIComponent(JSON.stringify(rules));
  window.open(`/api/1.0/contact.csv?rules=${rulesQuery}`, '_blank');
}
</script>
