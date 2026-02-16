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
import type {
  GetCalloutResponseCommentData,
  UpdateCalloutResponseCommentData,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppButtonGroup,
  AppConfirmDialog,
  formatLocale,
} from '@beabee/vue';

import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { client } from '#utils/api';

import CalloutResponseCommentForm from './CalloutResponseCommentForm.vue';

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
  currentComment.value = await client.callout.response.comment.update(
    props.comment.id,
    {
      text: data.text,
    }
  );
  formVisible.value = false;
}

async function handleDelete() {
  await client.callout.response.comment.delete(currentComment.value.id);
  await props.onDelete?.();
}
</script>
