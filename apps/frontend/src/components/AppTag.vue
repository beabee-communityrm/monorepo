<template>
  <span
    class="mr-1 inline-block whitespace-nowrap rounded border border-white bg-white px-1 py-0.5 text-xs font-bold text-link"
  >
    {{ props.tag }}
    <font-awesome-icon
      v-if="props.hasRemoveIcon"
      class="ml-2 inline-block cursor-pointer hover:text-link-110"
      :icon="faTimes"
      @click="$emit('click:removeTag')"
    />
  </span>
</template>

<script lang="ts" setup>
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const props = defineProps<{
  tag: string;
  hasRemoveIcon?: boolean;
}>();

defineEmits(['click:removeTag']);
</script>
