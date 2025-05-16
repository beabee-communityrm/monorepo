<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <div v-for="(item, i) in items" :key="i" class="mb-4 flex gap-4">
      <slot :item="item" :index="i" />
      <div class="flex-0 self-end">
        <button
          class="-ml-2 p-2 leading-tight text-primary-80 hover:text-primary"
          type="button"
          @click="removeItem(i)"
        >
          <font-awesome-icon :icon="faTimes" />
        </button>
      </div>
    </div>
    <AppButton
      variant="primaryOutlined"
      size="sm"
      :icon="faPlus"
      @click="addItem"
    >
      {{ addLabel }}
    </AppButton>
  </div>
</template>
<script lang="ts" setup generic="T">
import { AppButton } from '@beabee/vue/components';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * Props for the AppRepeatable component
 */
export interface AppRepeatableProps<T> {
  /** The new item to add */
  newItem: () => T;
  /** The label to display on the add button */
  addLabel: string;
}

const props = defineProps<AppRepeatableProps<T>>();
const items = defineModel<T[]>({ default: [] });

function addItem() {
  items.value = [...items.value, props.newItem()];
}

function removeItem(n: number) {
  items.value = items.value.filter((_, i) => i !== n);
}
</script>
