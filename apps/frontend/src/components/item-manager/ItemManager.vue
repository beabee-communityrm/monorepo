<template>
  <div>
    <ItemManagerItem
      v-for="(item, i) in items"
      :key="i"
      :item="item"
      :item-to-data="itemToData"
      :delete-title="deleteTitle"
      :delete-text="deleteText(item)"
      :no-update="!!noUpdate"
      @update="(data) => onUpdate?.(item, data)"
      @delete="() => onDelete?.(item)"
    >
      <template #view>
        <slot name="view" :item="item" />
      </template>
      <template #form="{ data, mode }">
        <slot name="form" :data="data" :mode="mode" />
      </template>
    </ItemManagerItem>

    <div
      v-if="formVisible"
      class="rounded rounded-t-none border border-primary-20 bg-primary-10 p-4"
    >
      <ItemManagerForm
        mode="add"
        :data="itemToData(undefined)"
        @cancel="formVisible = false"
        @save="handleAdd"
      >
        <template #default="{ data, mode }">
          <slot name="form" :data="data" :mode="mode" />
        </template>
      </ItemManagerForm>
    </div>
    <AppButton
      v-else
      class="w-full"
      variant="primaryOutlined"
      @click="formVisible = true"
    >
      {{ addButtonText }}
    </AppButton>
  </div>
</template>
<script lang="ts" setup generic="T, D">
import { AppButton } from '@beabee/vue';
import { ref } from 'vue';
import ItemManagerItem from './ItemManagerItem.vue';
import ItemManagerForm from './ItemManagerForm.vue';

const props = defineProps<{
  items: T[];
  itemToData: (item: T | undefined) => D;
  addButtonText: string;
  deleteTitle: string;
  deleteText: (item: T) => string;
  noUpdate?: boolean;
  onAdd?: (data: D) => Promise<void>;
  onUpdate?: (item: T, data: D) => Promise<void> | undefined;
  onDelete?: (item: T) => Promise<void> | undefined;
}>();

const formVisible = ref(false);

async function handleAdd(data: D) {
  await props.onAdd?.(data);
  formVisible.value = false;
}
</script>
