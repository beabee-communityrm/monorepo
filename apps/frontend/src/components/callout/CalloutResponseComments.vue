<template>
  <AppHeading>
    {{ t('calloutResponseComments.comments') }}
  </AppHeading>

  <CalloutResponseComment
    v-for="comment in comments.items"
    :key="comment.id"
    :comment="comment"
    @delete="refreshComments"
  />
  <div class="bg-white p-4">
    <AppSubHeading>
      {{ t('calloutResponseComments.addComment') }}
    </AppSubHeading>
    <CalloutResponseCommentForm @submit="handleSubmit" />
  </div>
</template>

<script lang="ts" setup>
import {
  createCalloutResponseComment,
  fetchCalloutResponseComments,
} from '../../utils/api/callout-response-comments';
import AppHeading from '../AppHeading.vue';
import AppSubHeading from '../AppSubHeading.vue';
import CalloutResponseComment from './CalloutResponseComment.vue';
import CalloutResponseCommentForm from './CalloutResponseCommentForm.vue';
import { type CommentFormData } from './calloutResponseComment.interface';
import { type Paginated } from '@beabee/beabee-common';
import { onBeforeMount, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  GetCalloutResponseCommentData,
  GetCalloutResponseCommentsQuery,
} from '@type';

const { t } = useI18n();

const props = defineProps<{
  responseId: string;
}>();

const comments = ref<Paginated<GetCalloutResponseCommentData>>({
  total: 0,
  count: 0,
  offset: 0,
  items: [],
});

async function refreshComments() {
  const query: GetCalloutResponseCommentsQuery = {
    limit: 100,
    rules: {
      rules: [
        { field: 'responseId', operator: 'equal', value: [props.responseId] },
      ],
      condition: 'AND',
    },
    order: 'ASC',
    sort: 'createdAt',
  };
  comments.value = await fetchCalloutResponseComments(query);
}

watch(toRef(props, 'responseId'), refreshComments);

onBeforeMount(refreshComments);

async function handleSubmit(commentData: CommentFormData) {
  await createCalloutResponseComment({
    text: commentData.text,
    responseId: props.responseId,
  });

  await refreshComments();
}
</script>
