<template>
  <AppForm
    :button-text="
      props.comment
        ? t('calloutResponseComments.actions.updateComment')
        : t('calloutResponseComments.actions.addComment')
    "
    :reset-button-text="props.comment && t('actions.cancel')"
    @submit.prevent="handleSubmit"
    @reset="emit('cancel')"
  >
    <div class="mb-4">
      <RichTextEditor v-model="data.text" required />
    </div>
  </AppForm>
</template>

<script lang="ts" setup>
import type { GetCalloutResponseCommentData } from '@beabee/beabee-common';
import { AppForm } from '@beabee/vue/components';

import useVuelidate from '@vuelidate/core';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import RichTextEditor from '../rte/RichTextEditor.vue';
import { type CommentFormData } from './calloutResponseComment.interface';

const { t } = useI18n();

const validation = useVuelidate();

const emit = defineEmits(['cancel']);

const props = defineProps<{
  comment?: GetCalloutResponseCommentData;
  onSubmit?: (data: CommentFormData) => Promise<void>;
}>();

const data = reactive<CommentFormData>({
  text: props.comment?.text || '',
});

async function handleSubmit() {
  await props.onSubmit?.(data);
  validation.value.$reset();
  data.text = '';
}
</script>
