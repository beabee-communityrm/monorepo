<route lang="yaml">
name: adminCalloutViewResponsesTable
meta:
  pageTitle: menu.callouts
  role: admin
</route>

<template>
  <div class="md:flex">
    <div class="hidden flex-none basis-[220px] md:block">
      <AppVTabs v-model="currentBucket" :items="bucketItems" />
    </div>
    <div class="flex-1">
      <AppSearch
        v-model="currentRules"
        :filter-groups="filterGroups"
        @reset="currentRules = undefined"
      >
        <AppSelect
          v-model="currentTag"
          :placeholder="t('calloutResponsesPage.searchTag')"
          :items="tagItems"
        />
        <AppSelect
          v-model="currentAssignee"
          :placeholder="t('calloutResponsesPage.searchAssignee')"
          :items="adminItems"
        />
      </AppSearch>
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
              :manage-url="`${route.path}/tags`"
              :loading="doingAction"
              :disabled="selectedCount === 0"
              @toggle="
                (tagId, successText) =>
                  handleUpdateAction({ tags: [tagId] }, successText)
              "
            />
            <SetAssigneeButton
              :disabled="selectedCount === 0"
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

        <template #after="{ item }">
          <div
            v-if="
              item.tags.length > 0 ||
              (currentInlineComponent && item.answers) ||
              (showLatestComment && item.latestComment)
            "
            class="flex flex-col gap-2"
          >
            <div v-if="item.tags.length > 0">
              <font-awesome-icon :icon="faTag" class="mr-2" />
              <AppTag v-for="tag in item.tags" :key="tag.id" :tag="tag.name" />
            </div>
            <p v-if="currentInlineComponent && item.answers">
              <font-awesome-icon :icon="faUserPen" class="mr-2" />
              <b>{{ t('calloutResponsesPage.showAnswer') }}:{{ ' ' }}</b>
              <span class="italic">
                {{
                  stringifyAnswer(
                    currentInlineComponent,
                    (item.answers[currentInlineComponent.slideId] as any)?.[
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
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  type Paginated,
  type Rule,
  type RuleGroup,
  stringifyAnswer,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import AppButton from '@components/button/AppButton.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import AppVTabs from '@components/tabs/AppVTabs.vue';
import {
  headers,
  useCalloutResponseFilters,
} from '@components/pages/admin/callout-responses.interface';
import AppSearch from '@components/search/AppSearch.vue';

import { fetchResponses } from '@utils/api/callout';
import AppButtonGroup from '@components/button/AppButtonGroup.vue';
import { updateCalloutResponses } from '@utils/api/callout-response';
import AppTag from '@components/AppTag.vue';
import MoveBucketButton from '@components/pages/admin/callouts/MoveBucketButton.vue';
import ToggleTagButton from '@components/pages/admin/callouts/ToggleTagButton.vue';
import { buckets } from '@components/pages/admin/callouts/callouts.interface';
import SetAssigneeButton from '@components/pages/admin/callouts/SetAssigneeButton.vue';
import { fetchContacts } from '@utils/api/contact';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import {
  definePaginatedQuery,
  defineParam,
  defineRulesParam,
} from '@utils/pagination';
import AppCheckbox from '@components/forms/AppCheckbox.vue';
import {
  faComment,
  faDownload,
  faTag,
  faUser,
  faUserPen,
} from '@fortawesome/free-solid-svg-icons';
import { addNotification } from '@store/notifications';
import { addBreadcrumb } from '@store/breadcrumb';
import AppTime from '@components/AppTime.vue';

import type {
  GetCalloutDataWith,
  GetCalloutResponseWith,
  GetCalloutResponseDataWith,
  UpdateCalloutResponseData,
} from '@type';
import { toRef } from 'vue';

const props = defineProps<{ callout: GetCalloutDataWith<'form'> }>();

const { t, n } = useI18n();
const route = useRoute();

const responses = ref<
  Paginated<
    GetCalloutResponseDataWith<
      'answers' | 'assignee' | 'contact' | 'latestComment' | 'tags'
    > & {
      selected: boolean;
    }
  >
>();
const showLatestComment = ref(false);
const doingAction = ref(false);

const showInlineAnswer = ref(false);
const currentInlineAnswer = ref('');
const currentInlineComponent = computed(
  () =>
    showInlineAnswer.value &&
    formComponents.value.find(
      (c) => `answers.${c.fullKey}` === currentInlineAnswer.value
    )
);

const selectedResponseItems = computed(
  () => responses.value?.items.filter((ri) => ri.selected) || []
);

const selectedCount = computed(() => selectedResponseItems.value.length);

const selectedTags = computed(() => {
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

const selectedAssigneeId = computed(() => {
  let assigneeId = selectedResponseItems.value[0]?.assignee?.id;
  for (const item of selectedResponseItems.value) {
    if (assigneeId !== item.assignee?.id) {
      return '';
    }
  }
  return assigneeId;
});

const adminItems = ref<{ id: string; label: string }[]>([]);

const bucketItems = computed(() =>
  buckets.value.map((bucket) => ({
    ...bucket,
    to: `${route.path}?bucket=${bucket.id}`,
  }))
);

const { formComponents, answerItems, filterGroups, tagItems } =
  useCalloutResponseFilters(toRef(props, 'callout'));

const currentAssignee = defineParam('assignee', (v) => v || '');
const currentTag = defineParam('tag', (v) => v || '');
const currentBucket = defineParam('bucket', (v) => v || '', 'replace');
const currentPaginatedQuery = definePaginatedQuery('createdAt');
const currentRules = defineRulesParam();

onBeforeMount(async () => {
  const admins = await fetchContacts({
    rules: {
      condition: 'AND',
      rules: [
        { field: 'activePermission', operator: 'equal', value: ['admin'] },
      ],
    },
  });

  adminItems.value = admins.items.map((admin) => ({
    id: admin.id,
    label: admin.displayName,
  }));
});

addBreadcrumb(
  computed(() => [
    {
      title: t('calloutAdmin.responses'),
      to: `/admin/callouts/view/${props.callout.slug}/responses`,
    },
    {
      title:
        bucketItems.value.find((b) => b.id === currentBucket.value)?.label ||
        '',
    },
  ])
);

function getSearchRules(): RuleGroup {
  const bucketRule: Rule = currentBucket.value
    ? { field: 'bucket', operator: 'equal', value: [currentBucket.value] }
    : { field: 'bucket', operator: 'is_empty', value: [] };

  const rules: RuleGroup = { condition: 'AND', rules: [bucketRule] };

  if (currentRules.value) {
    rules.rules.push(currentRules.value);
  }

  if (currentTag.value) {
    rules.rules.push({
      field: 'tags',
      operator: 'contains',
      value: [currentTag.value],
    });
  }

  if (currentAssignee.value) {
    rules.rules.push({
      field: 'assignee',
      operator: 'equal',
      value: [currentAssignee.value],
    });
  }

  return rules;
}

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

async function refreshResponses() {
  const _with: GetCalloutResponseWith[] = ['assignee', 'contact', 'tags'];
  if (showLatestComment.value) {
    _with.push('latestComment');
  }
  if (showInlineAnswer.value) {
    _with.push('answers');
  }

  const newResponses = await fetchResponses(
    props.callout.slug,
    {
      ...currentPaginatedQuery.query,
      rules: getSearchRules(),
    },
    _with
  );

  responses.value = {
    ...newResponses,
    items: newResponses.items.map((r) => ({ ...r, selected: false })),
  };
}

watchEffect(refreshResponses);

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

async function handleUpdateAction(
  updates: UpdateCalloutResponseData,
  successText: string
): Promise<void> {
  doingAction.value = true;

  await updateCalloutResponses(getSelectedResponseRules(), updates);
  await refreshResponses();

  addNotification({
    variant: 'success',
    title: successText,
  });

  doingAction.value = false;
}
</script>
