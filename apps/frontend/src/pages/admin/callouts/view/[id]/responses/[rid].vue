<route lang="yaml">
name: adminCalloutViewResponsesItem
meta:
  pageTitle: menu.callouts
  role: admin
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
            `/admin/callouts/view/${callout.slug}/responses/${prevResponse.id}`
          "
        />
        <AppButton
          type="button"
          variant="primaryOutlined"
          :icon="faCaretRight"
          :disabled="!nextResponse"
          :to="
            nextResponse &&
            `/admin/callouts/view/${callout.slug}/responses/${nextResponse.id}`
          "
        />
      </AppButtonGroup>
    </div>

    <AppHeading>
      {{ t('calloutResponsesPage.responseNo', { no: n(response.number) }) }}
    </AppHeading>
    <p v-if="response.tags.length > 0" class="mb-4">
      <font-awesome-icon :icon="faTag" class="mr-2" />
      <AppTag v-for="tag in response.tags" :key="tag.id" :tag="tag.name" />
    </p>

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
        :manage-url="`/admin/callouts/view/${callout.slug}/responses/tags`"
        :loading="doingAction"
        @toggle="
          (tagId, successText) => handleUpdate({ tags: [tagId] }, successText)
        "
      />
      <SetAssigneeButton
        size="sm"
        with-text
        :current-assignee-id="response.assignee?.id"
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
        :to="`/callouts/${callout.slug}/map#response-${response.number}`"
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
import { computed, onBeforeMount, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CalloutResponseAnswers } from '@beabee/beabee-common';
import {
  faCaretLeft,
  faCaretRight,
  faMap,
  faPen,
  faTag,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import AppHeading from '@components/AppHeading.vue';
import AppInfoList from '@components/AppInfoList.vue';
import AppInfoListItem from '@components/AppInfoListItem.vue';
import AppButton from '@components/button/AppButton.vue';
import AppButtonGroup from '@components/button/AppButtonGroup.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import MoveBucketButton from '@components/pages/admin/callouts/MoveBucketButton.vue';
import ToggleTagButton from '@components/pages/admin/callouts/ToggleTagButton.vue';
import { buckets } from '@components/pages/admin/callouts/callouts.interface';
import AppTag from '@components/AppTag.vue';
import CalloutResponseComments from '@components/callout/CalloutResponseComments.vue';
import SetAssigneeButton from '@components/pages/admin/callouts/SetAssigneeButton.vue';
import AppNotification from '@components/AppNotification.vue';
import CalloutForm from '@components/pages/callouts/CalloutForm.vue';

import { addNotification } from '@store/notifications';

import { formatLocale } from '@utils/dates';
import { fetchResponses, fetchTags } from '@utils/api/callout';
import {
  fetchCalloutResponse,
  updateCalloutResponse,
} from '@utils/api/callout-response';

import type {
  GetCalloutDataWith,
  GetCalloutResponseData,
  GetCalloutResponseDataWith,
  UpdateCalloutResponseData,
} from '@type';

const props = defineProps<{
  rid: string;
  callout: GetCalloutDataWith<'form' | 'responseViewSchema'>;
}>();

const { t, n } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      title: t('calloutAdmin.responses'),
      to: `/admin/callouts/view/${props.callout.slug}/responses`,
    },
    {
      title: bucketName.value,
      to: `/admin/callouts/view/${props.callout.slug}/responses?bucket=${response.value?.bucket}`,
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
    GetCalloutResponseDataWith<'answers' | 'assignee' | 'contact' | 'tags'>
  >();
const prevResponse = ref<GetCalloutResponseData>();
const nextResponse = ref<GetCalloutResponseData>();
const responseNo = ref(0);
const totalResponses = ref(0);

const tagItems = ref<{ id: string; label: string }[]>([]);

const editMode = ref(false);
const doingAction = ref(false);

const bucketName = computed(() =>
  response.value
    ? buckets.value.find((bucket) => bucket.id === response.value?.bucket)
        ?.label || response.value.bucket
    : ''
);

async function handleUpdate(
  data: UpdateCalloutResponseData,
  successText: string
) {
  if (!response.value) return;

  doingAction.value = true;
  await updateCalloutResponse(response.value.id, data);
  await refreshResponse();

  addNotification({ variant: 'success', title: successText });

  doingAction.value = false;
}

async function handleEditResponse(answers: CalloutResponseAnswers) {
  await handleUpdate({ answers }, t('form.saved'));
  editMode.value = false;
}

onBeforeMount(async () => {
  const tags = await fetchTags(props.callout.slug);
  tagItems.value = tags.map((tag) => ({ id: tag.id, label: tag.name }));
});

async function refreshResponse() {
  const newResponse = await fetchCalloutResponse(props.rid, [
    'answers',
    'assignee',
    'contact',
    'tags',
  ]);

  const olderResponses = await fetchResponses(props.callout.slug, {
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
  });

  const newerResponses = await fetchResponses(props.callout.slug, {
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
  });

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
