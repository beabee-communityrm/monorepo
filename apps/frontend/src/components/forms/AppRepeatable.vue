<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <div v-for="(item, i) in modelValue" :key="i" class="mb-4 flex gap-4">
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
import { AppButton } from '@beabee/vue';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

/**
 * Props for the AppRepeatable component
 */
export interface AppRepeatableProps<T> {
  /** The model value of the repeatable component */
  modelValue: T[];
  /** The new item to add */
  newItem: () => T;
  /** The label to display on the add button */
  addLabel: string;
}

const props = defineProps<AppRepeatableProps<T>>();

function addItem() {
  // eslint-disable-next-line vue/no-mutating-props
  props.modelValue.push(props.newItem());
}

function removeItem(n: number) {
  // eslint-disable-next-line vue/no-mutating-props
  props.modelValue.splice(n, 1);
}
</script>
