<template>
  <div
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    class="flex flex-grow basis-[120px] flex-wrap overflow-hidden rounded p-[1px]"
    @keydown="handleKeydown"
  >
    <button
      v-for="item in items"
      :key="item.value"
      ref="buttonRefs"
      type="button"
      role="radio"
      :aria-checked="item.value === modelValue"
      :tabindex="item.value === modelValue ? 0 : -1"
      class="flex-grow basis-[90px] bg-white text-sm font-semibold outline outline-1 outline-primary-40"
      :class="[
        size === 'xs' ? 'p-2' : 'p-2.5',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : item.value === modelValue
            ? 'z-20 !bg-link font-bold text-white !outline-link-110'
            : 'hover:z-10 hover:bg-link-10 hover:outline-link',
      ]"
      :disabled="disabled"
      @click="selectItem(item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script lang="ts" setup generic="T extends string | number">
import { nextTick, ref } from 'vue';

/**
 * Props for the AppChoice component
 */
export interface AppChoiceProps<T extends string | number> {
  /** The model value of the choice */
  modelValue: T;
  /** The items for the choice */
  items: { label: string; value: T }[];
  /** Whether the choice is disabled */
  disabled?: boolean;
  /** The size of the choice */
  size?: 'xs' | 'sm';
  /** Accessible label for the choice group */
  ariaLabel?: string;
  /** ID of element that labels the choice group */
  ariaLabelledby?: string;
}

const emit = defineEmits(['update:modelValue']);
const props = withDefaults(defineProps<AppChoiceProps<T>>(), {
  size: 'sm',
});

const buttonRefs = ref<HTMLButtonElement[]>([]);

/**
 * Select an item and emit the update
 */
const selectItem = (value: T) => {
  if (!props.disabled) {
    emit('update:modelValue', value);
  }
};

/**
 * Handle keyboard navigation
 */
const handleKeydown = async (event: KeyboardEvent) => {
  if (props.disabled) return;

  const currentIndex = props.items.findIndex(
    (item) => item.value === props.modelValue
  );
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      newIndex = (currentIndex + 1) % props.items.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      newIndex = currentIndex === 0 ? props.items.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = props.items.length - 1;
      break;
    default:
      return;
  }

  // Update the model value
  emit('update:modelValue', props.items[newIndex].value);

  // Focus the new button
  await nextTick();
  buttonRefs.value[newIndex]?.focus();
};
</script>
