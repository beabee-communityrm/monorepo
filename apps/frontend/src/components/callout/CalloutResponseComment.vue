<template>
  <div class="mb-4 bg-white p-4">
    <div
      class="mb-4 flex items-center justify-between border-b border-primary-40 pb-2"
    >
      <span>
        <router-link
          :to="`/admin/contacts/${comment.contact.id}`"
          class="font-semibold text-link"
        >
          {{ comment.contact.displayName }}
        </router-link>
        -
        {{ formatLocale(comment.createdAt, 'Pp') }}
      </span>
      <AppButtonGroup>
        <AppButton
          size="sm"
          :icon="faPencil"
          variant="primaryOutlined"
          :title="t('actions.edit')"
          @click="formVisible = !formVisible"
        />
        <AppButton
          size="sm"
          :icon="faTrash"
          variant="danger"
          :title="t('actions.delete')"
          @click="showDeleteModal = true"
        />
      </AppButtonGroup>
    </div>

    <CalloutResponseCommentForm
      v-if="formVisible"
      :comment="currentComment"
      @submit="handleEditSubmit"
      @cancel="formVisible = false"
    />
    <div v-else class="content-message" v-html="currentComment.text" />

    <AppConfirmDialog
      :open="showDeleteModal"
      :title="t('calloutResponseComments.confirmDelete.title')"
      :cancel="t('actions.noBack')"
      :confirm="t('actions.yesDelete')"
      variant="danger"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    >
      <p>{{ t('calloutResponseComments.confirmDelete.text') }}</p>
    </AppConfirmDialog>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';

import AppButton from '@components/button/AppButton.vue';
import AppButtonGroup from '@components/button/AppButtonGroup.vue';
import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import CalloutResponseCommentForm from './CalloutResponseCommentForm.vue';

import {
  deleteCalloutResponseComment,
  updateCalloutResponseComment,
} from '@utils/api/callout-response-comments';
import { formatLocale } from '@utils/dates';

import type {
  GetCalloutResponseCommentData,
  UpdateCalloutResponseCommentData,
} from '@type';

const { t } = useI18n();

const props = defineProps<{
  comment: GetCalloutResponseCommentData;
  onDelete?: () => Promise<void>;
}>();

const formVisible = ref(false);
const showDeleteModal = ref(false);
const currentComment = ref<GetCalloutResponseCommentData>(props.comment);

onBeforeMount(() => {
  currentComment.value = props.comment;
});

async function handleEditSubmit(data: UpdateCalloutResponseCommentData) {
  currentComment.value = await updateCalloutResponseComment(props.comment.id, {
    text: data.text,
  });
  formVisible.value = false;
}

async function handleDelete() {
  await deleteCalloutResponseComment(currentComment.value.id);
  await props.onDelete?.();
}
</script>
