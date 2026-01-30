<template>
  <form @submit.prevent="submit">
    <AppInput v-model="searchText" :placeholder="placeholder" @blur="submit">
      <template #suffixAction>
        <div class="flex h-10 items-center">
          <button
            v-if="searchText.length > 0"
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none"
            @click="emit('update:modelValue', '')"
          >
            <font-awesome-icon :icon="faTimes" />
          </button>
          <button
            type="submit"
            class="flex h-10 w-10 shrink-0 items-center justify-center text-primary-80 hover:bg-primary-10 focus:outline-none"
          >
            <font-awesome-icon :icon="faSearch" />
          </button>
        </div>
      </template>
    </AppInput>
  </form>
</template>

<script lang="ts" setup>
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ref, watch } from 'vue';

import AppInput from './AppInput.vue';

/**
 * Props for the AppSearchInput component
 */
export interface AppSearchInputProps {
  /** The model value of the search input */
  modelValue: string;
  /** The placeholder text for the search input */
  placeholder: string;
}

const emit = defineEmits(['update:modelValue']);
const props = defineProps<AppSearchInputProps>();

const searchText = ref(props.modelValue);

function submit() {
  emit('update:modelValue', searchText.value);
}

watch(
  () => props.modelValue,
  (newValue) => {
    searchText.value = newValue;
  }
);
</script>
