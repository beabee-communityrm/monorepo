<template>
  <div class="mb-3 rounded border border-primary-20 bg-primary-10">
    <div class="flex items-center bg-primary-5 p-2 pl-4 text-sm">
      <strong class="font-bold text-body-80">
        <font-awesome-icon :icon="faTag" class="mr-2" />{{ tag.name }}
      </strong>
      <AppButtonGroup class="ml-auto">
        <AppButton
          size="sm"
          variant="text"
          @click="formVisible = !formVisible"
          >{{ t('actions.edit') }}</AppButton
        >
        <AppButton
          size="sm"
          variant="dangerText"
          @click="showDeleteModal = true"
        >
          {{ t('actions.delete') }}
        </AppButton>
      </AppButtonGroup>
    </div>

    <TagEditorForm
      v-if="formVisible"
      class="p-4"
      :tag="tag"
      @save="handleSave"
      @cancel="formVisible = false"
    />
    <AppConfirmDialog
      :open="showDeleteModal"
      :title="t('tagEditor.confirmDelete.title')"
      :cancel="t('actions.noBack')"
      :confirm="t('actions.yesRemove')"
      variant="danger"
      @close="showDeleteModal = false"
      @confirm="$emit('delete', tag.id)"
    >
      <p>{{ t('tagEditor.confirmDelete.text') }}</p>
    </AppConfirmDialog>
  </div>
</template>
<script lang="ts" setup>
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppConfirmDialog from '../AppConfirmDialog.vue';
import AppButton from '../button/AppButton.vue';
import AppButtonGroup from '../button/AppButtonGroup.vue';
import TagEditorForm from './TagEditorForm.vue';

import type { GetCalloutTagData, UpdateCalloutTagData } from '@type';

defineEmits<{
  (e: 'delete', id: string): void;
}>();
const props = defineProps<{
  tag: GetCalloutTagData;
  onUpdate?: (data: UpdateCalloutTagData) => Promise<void>;
}>();

const { t } = useI18n();

const formVisible = ref(false);
const showDeleteModal = ref(false);

async function handleSave(data: UpdateCalloutTagData) {
  await props.onUpdate?.(data);
  formVisible.value = false;
}
</script>
