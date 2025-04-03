<template>
  <div
    class="flex flex-grow basis-[120px] flex-wrap overflow-hidden rounded p-[1px]"
  >
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="flex-grow basis-[90px] bg-white text-sm font-semibold outline outline-1 outline-primary-40"
      :class="[
        size === 'xs' ? 'p-2' : 'p-2.5',
        disabled
          ? 'opacity-50'
          : item.value === modelValue
            ? 'z-20 !bg-link font-bold text-white !outline-link-110'
            : 'hover:z-10 hover:bg-link-10 hover:outline-link',
      ]"
      :disabled="disabled"
      @click="$emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>
<script lang="ts" setup generic="T extends string | number">
export interface AppChoiceProps<T extends string | number> {
  /** The model value of the choice */
  modelValue: T;
  /** The items for the choice */
  items: { label: string; value: T }[];
  /** Whether the choice is disabled */
  disabled?: boolean;
  /** The size of the choice */
  size?: 'xs' | 'sm';
}

defineEmits(['update:modelValue']);
withDefaults(defineProps<AppChoiceProps<T>>(), {
  size: 'sm',
});
</script>
