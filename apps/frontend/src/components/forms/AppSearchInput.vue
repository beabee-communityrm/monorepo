<template>
  <form class="relative" @submit.prevent="submit">
    <AppInput
      v-model="searchText"
      class="pr-12"
      :placeholder="placeholder"
      @blur="submit"
    />
    <button
      v-if="searchText.length > 0"
      type="button"
      class="absolute right-5 top-0 h-full w-8 text-primary hover:text-primary-70"
      @click="emit('update:modelValue', '')"
    >
      <font-awesome-icon :icon="faTimes" />
    </button>
    <button
      class="absolute right-0 top-0 h-full w-8 text-primary hover:text-primary-70"
    >
      <font-awesome-icon :icon="faSearch" />
    </button>
  </form>
</template>

<script lang="ts" setup>
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ref, watch } from 'vue';
import AppInput from './AppInput.vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: string;
  placeholder: string;
}>();

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
