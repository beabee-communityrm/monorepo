<route lang="yaml">
name: adminCalloutViewResponsesTable
meta:
  pageTitle: menu.callouts
</route>

<template>
  <AppFilterGrid v-model="currentSegmentId" :items="segmentItems">
    <AppSearch
      v-model="currentRules"
      :filter-groups="filterGroups"
      @reset="currentRules = undefined"
    >
      <AppSelect
        v-model="currentTag"
        :placeholder="t('tags.searchTag')"
        :items="tagItems"
      />
      <AppSelect
        v-model="currentAssignee"
        :placeholder="t('calloutResponsesPage.searchAssignee')"
        :items="reviewerItems"
      />
    </AppSearch>
    <SaveSegment
      v-if="hasUnsavedSegment && currentRules"
      :segment="currentSegment"
      :rules="currentRules"
      :save-segment="saveSegment"
      :update-segment="updateSegment"
    />
    <p class="text-sm font-semibold text-body-80">{{ t('common.show') }}</p>
    <div class="mb-4 flex items-center gap-6 text-sm">
      <AppCheckbox
        v-model="showLatestComment"
        :label="t('calloutResponsesPage.showLatestComment')"
        :icon="faComment"
      />
      <div class="flex items-center gap-2">
        <AppCheckbox
          v-model="showInlineAnswer"
          :label="t('calloutResponsesPage.showAnswer')"
          :icon="faUserPen"
        />
        <AppSelect
          v-model="currentInlineAnswer"
          class="max-w-xs"
          :class="!showInlineAnswer && 'invisible'"
          :placeholder="t('common.selectOne')"
          :items="answerItems"
          required
        />
      </div>
    </div>
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      keypath="calloutResponsesPage.showingOf"
      :headers="headers"
      :result="responses"
      selectable
    >
      <template #actions>
        <AppButtonGroup>
          <AppButton
            :icon="faDownload"
            variant="primaryOutlined"
            :title="t('actions.export')"
            @click="handleExport"
          />
          <MoveBucketButton
            :current-bucket="currentBucket"
            :disabled="selectedCount === 0"
            :loading="doingAction"
            @move="
              (bucket, successText) =>
                handleUpdateAction({ bucket }, successText)
            "
          />
          <ToggleTagButton
            :tag-items="tagItems"
            :selected-tags="selectedTags"
            :manage-url="`/admin/crowdnewsroom/view/${callout.slug}/responses/tags`"
            :loading="doingAction"
            :selectable="selectedCount > 0"
            @toggle="
              (tagId, successText) =>
                handleUpdateAction({ tags: [tagId] }, successText)
            "
          />
          <SetAssigneeButton
            :reviewer-items="reviewerItems"
            :manage-url="
              canAdmin
                ? `/admin/crowdnewsroom/view/${callout.slug}/responses/tags`
                : undefined
            "
            :selectable="selectedCount > 0"
            :loading="doingAction"
            :current-assignee-id="selectedAssigneeId"
            @assign="
              (assigneeId, successText) =>
                handleUpdateAction({ assigneeId }, successText)
            "
          />
        </AppButtonGroup>
        <p v-if="selectedCount > 0" class="self-center text-sm">
          <i18n-t
            keypath="calloutResponsePage.selectedCount"
            :plural="selectedCount"
          >
            <template #n>
              <b>{{ selectedCount }}</b>
            </template>
          </i18n-t>
        </p>
      </template>

      <template #value-number="{ value, item }">
        <router-link
          :to="`${route.path}/${item.id}`"
          class="text-base font-bold text-link"
        >
          {{ t('calloutResponsesPage.responseNo', { no: n(value) }) }}
        </router-link>
      </template>
      <template #value-assignee="{ value }">
        <router-link
          v-if="value"
          :to="`/admin/contacts/${value.id}`"
          class="text-link"
        >
          {{ value.displayName }}
        </router-link>
        <span v-else>-</span>
      </template>
      <template #value-contact="{ value, item }">
        <router-link
          v-if="value"
          :to="`/admin/contacts/${value.id}`"
          class="text-link"
        >
          <font-awesome-icon :icon="faUser" class="mr-2" />{{
            value.displayName
          }}
        </router-link>
        <span v-else-if="item.guestName">
          {{ item.guestName }} ({{ item.guestEmail }})
        </span>
        <span v-else>-</span>
      </template>
      <template #value-createdAt="{ value }">
        <AppTime :datetime="value" />
      </template>

      <template
        #after="{
          item,
        }: {
          item: GetCalloutResponseDataWith<
            | GetCalloutResponseWith.Answers
            | GetCalloutResponseWith.Assignee
            | GetCalloutResponseWith.Contact
            | GetCalloutResponseWith.LatestComment
            | GetCalloutResponseWith.Tags
          >;
        }"
      >
        <div
          v-if="
            item.tags.length > 0 ||
            (currentInlineComponent && item.answers) ||
            (showLatestComment && item.latestComment)
          "
          class="flex flex-col gap-2"
        >
          <TagList :tags="item.tags" @select="currentTag = $event" />
          <p v-if="currentInlineComponent && item.answers">
            <font-awesome-icon :icon="faUserPen" class="mr-2" />
            <b>{{ t('calloutResponsesPage.showAnswer') }}:{{ ' ' }}</b>
            <span class="italic">
              {{
                stringifyAnswer(
                  currentInlineComponent,
                  item.answers[currentInlineComponent.slideId]?.[
                    currentInlineComponent.key
                  ]
                )
              }}
            </span>
          </p>
          <div v-if="showLatestComment && item.latestComment">
            <font-awesome-icon :icon="faComment" class="mr-2" />
            <AppTime
              class="font-semibold text-body-60"
              :datetime="item.latestComment.createdAt"
            />
            <b> • {{ item.latestComment.contact.displayName }}:{{ ' ' }}</b>
            <span
              class="inline-block italic"
              v-html="item.latestComment.text"
            ></span>
          </div>
        </div>
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>
<script lang="ts" setup>
import {
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  type Paginated,
  type RuleGroup,
  type UpdateCalloutResponseData,
  stringifyAnswer,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppButtonGroup,
  AppCheckbox,
  AppFilterGrid,
  AppSelect,
  AppTime,
  addNotification,
} from '@beabee/vue';

import {
  faComment,
  faDownload,
  faUser,
  faUserPen,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import {
  headers,
  useCalloutResponseFilters,
} from '#components/pages/admin/callout-responses.interface';
import MoveBucketButton from '#components/pages/admin/callouts/MoveBucketButton.vue';
import SetAssigneeButton from '#components/pages/admin/callouts/SetAssigneeButton.vue';
import SaveSegment from '#components/pages/admin/contacts/SaveSegment.vue';
import AppSearch from '#components/search/AppSearch.vue';
import AppPaginatedTable from '#components/table/AppPaginatedTable.vue';
import TagList from '#components/tag/TagList.vue';
import ToggleTagButton from '#components/tag/ToggleTagButton.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { canAdmin } from '#store/currentUser';
import { client } from '#utils/api';
import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '#utils/pagination';

import { useSegmentManagement } from '../../../../../../composables/useSegmentManagement';
import { useTagFilter } from '../../../../../../composables/useTagFilter';

/**
 * Callout Responses Table Component
 * Provides functionality for:
 * - Viewing and filtering callout responses
 * - Managing response tags
 * - Managing response buckets
 * - Managing response assignments
 * - Viewing response details (comments, answers)
 * - Exporting responses
 */

/**
 * Props & Composables
 */
const props = defineProps<{ callout: GetCalloutDataWith<'form'> }>();
const { t, n } = useI18n();
const route = useRoute();

/**
 * Table State
 * @description Manages the paginated table data and selection state
 */
const responses = ref<
  Paginated<
    GetCalloutResponseDataWith<
      | GetCalloutResponseWith.Answers
      | GetCalloutResponseWith.Assignee
      | GetCalloutResponseWith.Contact
      | GetCalloutResponseWith.LatestComment
      | GetCalloutResponseWith.Tags
    > & {
      selected: boolean;
    }
  >
>();

const selectedResponseItems = computed(
  () => responses.value?.items.filter((ri) => ri.selected) || []
);
const selectedCount = computed(() => selectedResponseItems.value.length);

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
  for (const item of selectedResponseItems.value) {
    for (const tag of item.tags) {
      tagCount[tag.id]++;
    }
  }
  return Object.entries(tagCount)
    .filter((tc) => tc[1] === selectedCount.value)
    .map(([tagId]) => tagId);
});

/**
 * Assignee Management
 * @description Handles assignee filtering and selection state
 */
const currentAssignee = defineParam('assignee', (v) => v || '');

const selectedAssigneeId = computed(() => {
  const assigneeId = selectedResponseItems.value[0]?.assignee?.id;
  for (const item of selectedResponseItems.value) {
    if (assigneeId !== item.assignee?.id) {
      return '';
    }
  }
  return assigneeId;
});

/**
 * Bucket Management
 * @description Handles bucket filtering and navigation
 */
const currentBucket = defineParam('bucket', (v) => v || '', 'replace');

/**
 * Answer Display Configuration
 * @description Manages the visibility and selection of inline answers
 */
const showInlineAnswer = ref(false);
const currentInlineAnswer = ref('');
const currentInlineComponent = computed(
  () =>
    showInlineAnswer.value &&
    formComponents.value.find(
      (c) => `answers.${c.fullKey}` === currentInlineAnswer.value
    )
);

/**
 * Comment Display Configuration
 */
const showLatestComment = ref(false);

const currentRules = defineRulesParam(
  computed(() => currentSegment.value?.ruleGroup)
);

/**
 * Segment Management
 * @description Handles segment filtering and saving
 */
const {
  currentSegmentId,
  hasUnsavedSegment,
  segmentItems,
  handleSavedSegment,
  currentSegment,
} = useSegmentManagement(
  `/admin/crowdnewsroom/view/${props.callout.slug}/responses`,
  'All Responses',
  listSegments,
  listTotalSegmentItems
);

async function saveSegment(name: string, rules: RuleGroup) {
  const segment = await client.callout.segments.create(props.callout.slug, {
    calloutId: props.callout.slug,
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
  const segment = await client.callout.segments.update(
    props.callout.slug,
    segmentId,
    {
      name,
      ruleGroup: rules,
    }
  );
  handleSavedSegment(segment);
  return segment;
}

async function listSegments() {
  return await client.callout.segments.list(
    props.callout.slug,
    { sort: 'order' },
    ['itemCount']
  );
}

async function listTotalSegmentItems() {
  return (await client.callout.listResponses(props.callout.slug, { limit: 1 }))
    .total;
}

/**
 * Search & Filter State
 * @description Manages search and filter parameters
 */
const currentPaginatedQuery = definePaginatedQuery('createdAt');
const { formComponents, answerItems, filterGroups, reviewerItems, tagItems } =
  useCalloutResponseFilters(toRef(props, 'callout'));

/**
 * Action State
 */
const doingAction = ref(false);

/**
 * Lifecycle Hooks
 */
addBreadcrumb(
  computed(() => [
    {
      title: t('calloutAdmin.responses'),
      to: `/admin/crowdnewsroom/view/${props.callout.slug}/responses`,
    },
    {
      title:
        segmentItems.value.find((e) => e.id === currentSegmentId.value)
          ?.label || '',
    },
  ])
);

/**
 * Helper Functions
 */

/**
 * Builds the search rules for the current filter state
 */
function getSearchRules(): RuleGroup {
  const rules: RuleGroup[] = [];

  if (currentRules.value) {
    rules.push(currentRules.value);
  }

  if (currentAssignee.value) {
    rules.push({
      condition: 'AND',
      rules: [
        {
          field: 'assignee',
          operator: 'equal',
          value: [currentAssignee.value],
        },
      ],
    });
  }

  return addTagToRules(rules, currentTag.value);
}

/**
 * Gets rules for selected responses
 */
function getSelectedResponseRules(): RuleGroup {
  return {
    condition: 'OR',
    rules: selectedResponseItems.value.map((item) => ({
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
 * Table State
 */
const isRefreshing = ref(false);

/**
 * Refreshes the response list based on current filters
 */
async function refreshResponses() {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    const _with: GetCalloutResponseWith[] = [
      GetCalloutResponseWith.Assignee,
      GetCalloutResponseWith.Contact,
      GetCalloutResponseWith.Tags,
    ];
    if (showLatestComment.value) {
      _with.push(GetCalloutResponseWith.LatestComment);
    }
    if (showInlineAnswer.value) {
      _with.push(GetCalloutResponseWith.Answers);
    }

    // Store currently selected IDs before refresh
    const selectedIds = new Set(
      selectedResponseItems.value.map((item) => item.id)
    );

    const newResponses = await client.callout.listResponses(
      props.callout.slug,
      {
        ...currentPaginatedQuery.query,
        rules: getSearchRules(),
      },
      _with
    );

    responses.value = {
      ...newResponses,
      items: newResponses.items.map((r) => ({
        ...r,
        selected: selectedIds.has(r.id),
      })),
    };
  } finally {
    isRefreshing.value = false;
  }
}

// Replace watchEffect with watch
watch(
  [
    currentPaginatedQuery,
    currentRules,
    currentAssignee,
    currentTag,
    currentBucket,
    showLatestComment,
    showInlineAnswer,
  ],
  () => refreshResponses(),
  { deep: true }
);

refreshResponses();

/**
 * Handles exporting responses
 */
function handleExport() {
  const rules: RuleGroup =
    selectedResponseItems.value.length > 0
      ? getSelectedResponseRules()
      : getSearchRules();

  const rulesQuery = encodeURIComponent(JSON.stringify(rules));

  window.open(
    `/api/1.0/callout/${props.callout.slug}/responses.csv?rules=${rulesQuery}`,
    '_blank'
  );
}

/**
 * Handles response update actions (tags, bucket, assignee)
 */
async function handleUpdateAction(
  updates: UpdateCalloutResponseData,
  successText: string
): Promise<void> {
  doingAction.value = true;
  try {
    await client.callout.response.updates(getSelectedResponseRules(), updates);
    await refreshResponses();
    addNotification({
      variant: 'success',
      title: successText,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    addNotification({
      variant: 'error',
      title: t('form.errorMessages.generic'),
    });
  }

  doingAction.value = false;
}
</script>
