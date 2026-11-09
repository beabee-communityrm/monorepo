<route lang="yaml">
name: adminActivity
meta:
  pageTitle: menu.activity
  role: admin
</route>

<template>
  <PageTitle :title="t('menu.activity')" border />
  <AppFilterGrid v-model="currentFilter" :items="filterItems">
    <AppSearch
      v-model="currentRules"
      :filter-groups="filterGroups"
      @reset="currentRules = undefined"
    />
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      :headers="headers"
      :result="activityTable"
    >
      <template #actions>
        <AppButton
          :icon="faDownload"
          variant="primaryOutlined"
          :title="t('actions.export')"
          @click="handleExport"
        />
      </template>
      <template #value-createdAt="{ value }">
        <span class="whitespace-nowrap">{{ formatLocale(value, 'PPpp') }}</span>
      </template>
      <template #value-eventType="{ value }">
        {{ getEventTypeLabel(value) }}
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import {
  ActivityActorType,
  ActivityEventType,
  type GetActivityEventData,
  type Paginated,
  type RuleGroup,
  isRuleGroup,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppFilterGrid,
  PageTitle,
  type TabItem,
  addNotification,
  formatLocale,
} from '@beabee/vue';

import { faDownload, faFileWaveform } from '@fortawesome/free-solid-svg-icons';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppSearch from '#components/search/AppSearch.vue';
import AppPaginatedTable from '#components/table/AppPaginatedTable.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import type { FilterGroups } from '#type/search';
import type { Header } from '#type/table';
import { getEventTypeLabel } from '#utils/activity';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';
import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '#utils/pagination';

const { t } = useI18n();

const filterItems = computed<TabItem[]>(() => [
  { id: '', label: t('activity.filters.all'), to: '/admin/activity' },
  {
    id: 'contact',
    label: t('menu.contacts'),
    to: '/admin/activity?category=contact',
  },
  {
    id: 'callout',
    label: t('menu.callouts'),
    to: '/admin/activity?category=callout',
  },
  {
    id: 'email',
    label: t('menu.emails'),
    to: '/admin/activity?category=email',
  },
  {
    id: 'payment',
    label: t('contactOverview.contribution'),
    to: '/admin/activity?category=payment',
  },
]);
const currentFilter = defineParam('category', (v) => v || '', 'replace');

/**
 * Maps an event type to its sidebar category
 */
function getEventCategory(type: ActivityEventType): string {
  // Combine contribution and payment events into one category
  if (
    type.startsWith('contact.contribution-') ||
    type.startsWith('contact.payment.')
  ) {
    return 'payment';
  }
  if (type.startsWith('callout.')) return 'callout';
  if (type.startsWith('email.')) return 'email';
  if (type.startsWith('contact.')) return 'contact';
  return 'other';
}

function getCategoryRules(): RuleGroup | undefined {
  if (!currentFilter.value) return;

  return {
    condition: 'OR',
    rules: Object.values(ActivityEventType)
      .filter((type) => getEventCategory(type) === currentFilter.value)
      .map((type) => ({
        field: 'eventType',
        operator: 'equal' as const,
        value: [type],
      })),
  };
}

const currentRules = defineRulesParam();
const filterGroups = computed<FilterGroups>(() => [
  {
    id: 'activity',
    label: t('menu.activity'),
    items: {
      createdAt: { type: 'date', label: t('activity.data.time') },
      actorType: {
        type: 'enum',
        label: t('activity.data.actorType'),
        options: [
          { id: 'user', label: t('activity.actorType.user') },
          { id: 'admin', label: t('activity.actorType.admin') },
          { id: 'system', label: t('activity.actorType.system') },
        ],
      },
    },
  },
]);

/**
 * Maps the actor type filter options to backend actor types: user and admin
 * are both user actors, every other actor type (cron, webhook, etc.) is system
 */
function mapActorTypeRules(group: RuleGroup): RuleGroup {
  return {
    ...group,
    rules: group.rules.map((rule) => {
      if (isRuleGroup(rule)) return mapActorTypeRules(rule);
      if (rule.field !== 'actorType') return rule;
      if (rule.value[0] === 'system') {
        return {
          ...rule,
          operator: rule.operator === 'equal' ? 'not_equal' : 'equal',
          value: [ActivityActorType.User],
        };
      }
      return { ...rule, value: [ActivityActorType.User] };
    }),
  };
}

/**
 * Builds the search rules for the current category and filters
 */
function getSearchRules(): RuleGroup {
  const rules: RuleGroup = { condition: 'AND', rules: [] };

  const categoryRules = getCategoryRules();
  if (categoryRules) {
    rules.rules.push(categoryRules);
  }

  if (currentRules.value) {
    rules.rules.push(mapActorTypeRules(currentRules.value));
  }

  return rules;
}

const headers = computed<Header[]>(() => [
  { value: 'createdAt', text: t('activity.data.time') },
  { value: 'eventType', text: t('activity.data.category') },
  { value: 'actorId', text: t('activity.data.actor') },
  { value: 'targetId', text: t('activity.data.target') },
]);

const currentPaginatedQuery = definePaginatedQuery('createdAt');

const activityTable = ref<Paginated<GetActivityEventData>>();

addBreadcrumb(
  computed(() => [
    { title: t('menu.activity'), to: '/admin/activity', icon: faFileWaveform },
  ])
);

/**
 * Action Handlers
 */

/**
 * Table state
 */
const isRefreshing = ref(false);

/**
 * Refreshes the activity table
 */
async function refreshResponses() {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    activityTable.value = await client.activity.list({
      ...currentPaginatedQuery.query,
      rules: getSearchRules(),
    });
  } catch (err) {
    activityTable.value = { items: [], offset: 0, count: 0, total: 0 };
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  } finally {
    isRefreshing.value = false;
  }
}

watch(
  [currentPaginatedQuery, currentFilter, currentRules],
  () => refreshResponses(),
  { deep: true }
);
refreshResponses();

/**
 * Handles exporting activity feed
 */
function handleExport() {
  const rulesQuery = encodeURIComponent(JSON.stringify(getSearchRules()));
  window.open(`/api/1.0/activity.csv?rules=${rulesQuery}`, '_blank');
}
</script>
