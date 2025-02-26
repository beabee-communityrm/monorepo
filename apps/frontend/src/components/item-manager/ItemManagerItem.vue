<template>
  <div class="mb-3 rounded border border-primary-20 bg-primary-10">
    <div class="flex items-center bg-primary-5 px-4 py-1 text-sm">
      <slot name="view" />
      <AppButtonGroup class="-mr-2 ml-auto">
        <AppButton
          v-if="!noUpdate"
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

    <ItemManagerForm
      v-if="formVisible"
      mode="update"
      class="p-4"
      :data="itemToData(item)"
      @save="handleUpdate"
      @cancel="formVisible = false"
    >
      <template #default="{ data, mode }">
        <slot name="form" :data="data" :mode="mode" />
      </template>
    </ItemManagerForm>

    <AppConfirmDialog
      :open="showDeleteModal"
      :title="deleteTitle"
      :cancel="t('actions.noBack')"
      :confirm="t('actions.yesRemove')"
      variant="danger"
      @close="showDeleteModal = false"
      @confirm="onDelete"
    >
      <p>{{ deleteText }}</p>
    </AppConfirmDialog>
  </div>
</template>
<script lang="ts" setup generic="T, D">
import { AppButton, AppButtonGroup } from '@beabee/vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ItemManagerForm from './ItemManagerForm.vue';
import AppConfirmDialog from '@components/AppConfirmDialog.vue';

const props = defineProps<{
  item: T;
  deleteTitle: string;
  deleteText: string;
  noUpdate: boolean;
  itemToData: (item: T | undefined) => D;
  onUpdate?: (data: D) => Promise<void> | undefined;
  onDelete?: () => Promise<void> | undefined;
}>();

const { t } = useI18n();

const formVisible = ref(false);
const showDeleteModal = ref(false);

async function handleUpdate(data: D) {
  await props.onUpdate?.(data);
  formVisible.value = false;
}
</script>
