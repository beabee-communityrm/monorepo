<template>
  <div v-if="tags.length > 0" class="relative ml-4">
    <font-awesome-icon :icon="faTag" class="absolute -ml-4 mt-1" />
    <div class="flex flex-wrap items-center gap-2">
      <AppTag
        v-for="tag in tags"
        :key="tag.id"
        :tag="tag.name"
        class="cursor-pointer hover:opacity-80"
        @click="handleTagClick(tag.id)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TagData } from '@beabee/beabee-common';
import { AppTag } from '@beabee/vue';

import { faTag } from '@fortawesome/free-solid-svg-icons';

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
