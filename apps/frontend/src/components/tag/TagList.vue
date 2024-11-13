<template>
  <div v-if="tags.length > 0" class="flex items-center gap-2">
    <font-awesome-icon :icon="faTag" class="mr-2" />
    <AppTag
      v-for="tag in tags"
      :key="tag.id"
      :tag="tag.name"
      class="cursor-pointer hover:opacity-80"
      @click="handleTagClick(tag.id)"
    />
  </div>
</template>

<script lang="ts" setup>
import { faTag } from '@fortawesome/free-solid-svg-icons';
import AppTag from '@components/AppTag.vue';
import type { TagData } from '@beabee/beabee-common';

defineProps<{
  tags: Pick<TagData, 'name' | 'id'>[];
  className?: string;
}>();

const emit = defineEmits<{
  (event: 'select', tagId: string): void;
}>();

function handleTagClick(tagId: string) {
  emit('select', tagId);
}
</script>
