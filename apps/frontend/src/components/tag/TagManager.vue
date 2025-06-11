<script lang="ts" setup>
import type { TagData, TagUpdateData } from '@beabee/beabee-common';
import type { TagClient } from '@beabee/client';
import { AppInput } from '@beabee/vue';

import AppHeading from '@components/AppHeading.vue';
import ItemManager from '@components/item-manager/ItemManager.vue';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Props for the TagManager component
 */
export interface TagManagerProps {
  /**
   * Contact id or other entity id with tagging support.
   * If not provided, the tags will be fetched from the root level (e.g. all contact tags).
   */
  entityId?: string | undefined;
  /**
   * Operations for the tag client.
   */
  operations: TagClient;
  /**
   * Type of entity to fetch tags for.
   */
  type?: 'contact' | 'response';
}

const props = defineProps<TagManagerProps>();
const { t } = useI18n();

const tags = ref<TagData[]>([]);

const deleteText = computed(() => {
  switch (props.type) {
    case 'contact':
      return 'tagEditor.confirmDelete.text_contact';
    case 'response':
      return 'tagEditor.confirmDelete.text_response';
    default:
      return 'tagEditor.confirmDelete.text_global';
  }
});

async function handleUpdateTag(tag: TagData, data: TagUpdateData) {
  const updatedTag = await props.operations.update(
    props.entityId,
    tag.id,
    data
  );
  tags.value = tags.value.map((tag2) =>
    tag2.id === tag.id ? updatedTag : tag2
  );
}

async function handleDeleteTag(tag: TagData) {
  await props.operations.delete(props.entityId, tag.id);
  tags.value = tags.value.filter((tag2) => tag2.id !== tag.id);
}

async function handleNewTag(data: TagUpdateData) {
  const tag = await props.operations.create(props.entityId, {
    name: data.name,
    description: '',
  });
  tags.value.push(tag);
}

function tagToFormData(tag?: TagData): TagUpdateData {
  return reactive({
    name: tag?.name || '',
  });
}

onBeforeMount(async () => {
  tags.value = await props.operations.list(props.entityId);
});
</script>

<template>
  <div>
    <AppHeading>
      {{ t('tags.manageTags') }}
    </AppHeading>

    <ItemManager
      :items="tags"
      :item-to-data="tagToFormData"
      :add-button-text="t('tagEditor.add')"
      :delete-title="t('tagEditor.confirmDelete.title')"
      :delete-text="(tag) => t(deleteText, { tagName: tag.name })"
      @add="handleNewTag"
      @update="handleUpdateTag"
      @delete="handleDeleteTag"
    >
      <template #view="{ item }">
        <strong class="font-bold text-body-80">
          <font-awesome-icon :icon="faTag" class="mr-2" />{{ item.name }}
        </strong>
      </template>

      <template #form="{ data }">
        <div class="mb-4">
          <AppInput v-model="data.name" :label="t('tagEditor.name')" required />
        </div>
      </template>
    </ItemManager>
  </div>
</template>
