<template>
  <div
    class="flex flex-wrap p-px font-semibold"
    :class="variant !== 'collapsed' && 'gap-2'"
  >
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="flex-1 border border-link p-2.5 enabled:hover:bg-link-10 disabled:opacity-50"
      :class="[
        variant === 'collapsed'
          ? 'border-l-0 first:rounded-l first:border-l last:rounded-r'
          : 'rounded',
        cols == 2 && 'basis-1/3', // 1/3 allows for gap-2 :/
        item.value === modelValue && 'bg-link-10',
      ]"
      :disabled="disabled"
      @click="$emit('update:modelValue', item.value)"
    >
      <slot :item="item">{{ item.label }}</slot>
    </button>
  </div>
</template>
<script lang="ts" setup generic="T extends string | number">
defineEmits<{ (evt: 'update:modelValue', value: T): void }>();
defineProps<{
  modelValue: T;
  items: { label?: string; value: T }[];
  disabled?: boolean;
  variant?: 'collapsed' | 'expanded';
  cols?: 2;
}>();
</script>
