<route lang="yaml">
name: adminCalloutViewResponsesItem
meta:
  pageTitle: menu.callouts
</route>
<template>
  <div v-if="response" class="md:max-w-2xl">
    <div class="mb-4 flex items-center justify-end gap-2 text-sm">
      <i18n-t tag="span" keypath="calloutResponsePage.responseOf">
        <template #no>
          <b>{{ n(responseNo) }}</b>
        </template>
        <template #total>
          <b>{{ n(totalResponses) }}</b>
        </template>
        <template #bucket>
          <b>{{ bucketName }}</b>
        </template>
      </i18n-t>
      <AppButtonGroup>
        <AppButton
          type="button"
          variant="primaryOutlined"
          :icon="faCaretLeft"
          :disabled="!prevResponse"
          :to="
            prevResponse &&
            `/admin/crowdnewsroom/view/${callout.slug}/responses/${prevResponse.id}`
          "
        />
        <AppButton
          type="button"
          variant="primaryOutlined"
          :icon="faCaretRight"
          :disabled="!nextResponse"
          :to="
            nextResponse &&
            `/admin/crowdnewsroom/view/${callout.slug}/responses/${nextResponse.id}`
          "
        />
      </AppButtonGroup>
    </div>

    <AppHeading>
      {{ t('calloutResponsesPage.responseNo', { no: n(response.number) }) }}
    </AppHeading>
    <TagList
      v-if="response.tags.length > 0"
      :tags="response.tags"
      class="mb-4"
      @select="
        (tagId) =>
          $router.push(
            `/admin/crowdnewsroom/view/${callout.slug}/responses?tag=${tagId}`
          )
      "
    />

    <AppInfoList class="mb-4">
      <AppInfoListItem :name="t('calloutResponse.data.contact')">
        <router-link
          v-if="response.contact"
          :to="`/admin/contacts/${response.contact.id}`"
          class="text-link"
        >
          <font-awesome-icon :icon="faUser" class="mr-2" />{{
            response.contact.displayName
          }}
        </router-link>
        <span v-else-if="response.guestName">
          {{ response.guestName }} ({{ response.guestEmail }})
        </span>
      </AppInfoListItem>
      <AppInfoListItem
        :name="t('calloutResponse.data.createdAt')"
        :value="formatLocale(response.createdAt, 'Pp')"
      />
      <AppInfoListItem :name="t('calloutResponse.data.assignee')">
        <router-link
          v-if="response.assignee"
          :to="`/admin/contacts/${response.assignee.id}`"
          class="text-link"
        >
          {{ response.assignee.displayName }}
        </router-link>
      </AppInfoListItem>
    </AppInfoList>

    <div class="flex gap-2">
      <MoveBucketButton
        size="sm"
        with-text
        :current-bucket="response.bucket"
        :disabled="doingAction"
        :loading="doingAction"
        @move="(bucket, successText) => handleUpdate({ bucket }, successText)"
      />
      <ToggleTagButton
        size="sm"
        with-text
        :tag-items="tagItems"
        :selected-tags="response.tags.map((t) => t.id)"
        :manage-url="`/admin/crowdnewsroom/view/${callout.slug}/responses/tags`"
        :loading="doingAction"
        @toggle="
          (tagId, successText) => handleUpdate({ tags: [tagId] }, successText)
        "
      />
      <SetAssigneeButton
        size="sm"
        with-text
        :reviewer-items="reviewerItems"
        :current-assignee-id="response.assignee?.id"
        :manage-url="`/admin/crowdnewsroom/view/${callout.slug}/responses/tags`"
        :disabled="doingAction"
        :loading="doingAction"
        @assign="
          (assigneeId, successText) => handleUpdate({ assigneeId }, successText)
        "
      />
    </div>

    <hr class="my-10 border-t border-primary-40" />

    <div class="mb-4 flex gap-2">
      <AppButton
        v-if="callout.responseViewSchema?.map"
        :to="`/crowdnewsroom/${callout.slug}/map#response-${response.number}`"
        :icon="faMap"
        size="sm"
      >
        {{ t('calloutResponsePage.actions.viewOnMap') }}
      </AppButton>
      <AppButton
        type="button"
        :icon="faPen"
        size="sm"
        variant="primaryOutlined"
        class="ml-auto"
        @click="editMode = !editMode"
      >
        {{ t('actions.edit') }}
      </AppButton>
    </div>

    <AppNotification
      v-if="editMode"
      variant="warning"
      class="mb-6"
      :title="t('calloutResponsePage.editMode')"
    />
    <CalloutForm
      :key="response.id + editMode"
      :callout="callout"
      :answers="response.answers"
      :readonly="!editMode"
      :all-slides="!editMode"
      @submit="handleEditResponse"
    />

    <hr class="my-10 border-t border-primary-40" />

    <CalloutResponseComments :response-id="response.id" />
  </div>
</template>
<script lang="ts" setup>
import {
  type CalloutResponseAnswersSlide,
  type GetCalloutDataWith,
  type GetCalloutResponseData,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  type UpdateCalloutResponseData,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppButtonGroup,
  AppHeading,
  AppInfoList,
  AppInfoListItem,
  AppNotification,
  addNotification,
  formatLocale,
} from '@beabee/vue';

import {
  faCaretLeft,
  faCaretRight,
  faMap,
  faPen,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref, toRef, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import CalloutResponseComments from '#components/callout/CalloutResponseComments.vue';
import { useCalloutResponseFilters } from '#components/pages/admin/callout-responses.interface';
import MoveBucketButton from '#components/pages/admin/callouts/MoveBucketButton.vue';
import SetAssigneeButton from '#components/pages/admin/callouts/SetAssigneeButton.vue';
import CalloutForm from '#components/pages/callouts/CalloutForm.vue';
import TagList from '#components/tag/TagList.vue';
import ToggleTagButton from '#components/tag/ToggleTagButton.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';
import { buckets } from '#utils/callouts';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema'>;
}>();

const route = useRoute('adminCalloutViewResponsesItem');
const { t, n } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      title: t('calloutAdmin.responses'),
      to: `/admin/crowdnewsroom/view/${props.callout.slug}/responses`,
    },
    {
      title: bucketName.value,
      to: `/admin/crowdnewsroom/view/${props.callout.slug}/responses?bucket=${response.value?.bucket}`,
    },
    {
      title: t('calloutResponsesPage.responseNo', {
        no: response.value?.number ? n(response.value?.number) : '?',
      }),
    },
  ])
);

const response =
  ref<
    GetCalloutResponseDataWith<
      | GetCalloutResponseWith.Answers
      | GetCalloutResponseWith.Assignee
      | GetCalloutResponseWith.Contact
      | GetCalloutResponseWith.Tags
    >
  >();
const prevResponse = ref<GetCalloutResponseData>();
const nextResponse = ref<GetCalloutResponseData>();
const responseNo = ref(0);
const totalResponses = ref(0);

const editMode = ref(false);
const doingAction = ref(false);

const bucketName = computed(() =>
  response.value
    ? buckets.value.find((bucket) => bucket.id === response.value?.bucket)
        ?.label || response.value.bucket
    : ''
);

const { reviewerItems, tagItems } = useCalloutResponseFilters(
  toRef(props, 'callout')
);

async function handleUpdate(
  data: UpdateCalloutResponseData,
  successText: string
) {
  if (!response.value) return;

  doingAction.value = true;
  try {
    await client.callout.response.update(response.value.id, data);
    await refreshResponse();

    addNotification({ variant: 'success', title: successText });
  } catch (err) {
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  }

  doingAction.value = false;
}

async function handleEditResponse(answers: CalloutResponseAnswersSlide) {
  await handleUpdate({ answers }, t('form.saved'));
  editMode.value = false;
}

async function refreshResponse() {
  const newResponse = await client.callout.response.get(route.params.rid, [
    GetCalloutResponseWith.Answers,
    GetCalloutResponseWith.Assignee,
    GetCalloutResponseWith.Contact,
    GetCalloutResponseWith.Tags,
  ]);

  const olderResponses = await client.callout.listResponses(
    props.callout.slug,
    {
      limit: 1,
      sort: 'createdAt',
      order: 'DESC',
      rules: {
        condition: 'AND',
        rules: [
          { field: 'bucket', operator: 'equal', value: [newResponse.bucket] },
          {
            field: 'createdAt',
            operator: 'less',
            value: [newResponse.createdAt.toISOString()],
          },
        ],
      },
    }
  );

  const newerResponses = await client.callout.listResponses(
    props.callout.slug,
    {
      limit: 1,
      sort: 'createdAt',
      order: 'ASC',
      rules: {
        condition: 'AND',
        rules: [
          { field: 'bucket', operator: 'equal', value: [newResponse.bucket] },
          {
            field: 'createdAt',
            operator: 'greater',
            value: [newResponse.createdAt.toISOString()],
          },
        ],
      },
    }
  );

  response.value = newResponse;
  prevResponse.value =
    olderResponses.count > 0 ? olderResponses.items[0] : undefined;
  nextResponse.value =
    newerResponses.count > 0 ? newerResponses.items[0] : undefined;
  responseNo.value = olderResponses.total + 1;
  totalResponses.value = olderResponses.total + newerResponses.total + 1;
}

watchEffect(refreshResponse);
</script>
