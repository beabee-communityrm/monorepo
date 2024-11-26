<script lang="ts" setup>
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeading from '@components/AppHeading.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import type { BreadcrumbItem } from '@type';
import { TagOperations } from '@utils/api';
import type { TagData, TagUpdateData } from '@beabee/beabee-common';
import ItemManager from '@components/item-manager/ItemManager.vue';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import AppInput from '@components/forms/AppInput.vue';

interface Props {
  /**
   * Contact id or other entity id with tagging support.
   * If not provided, the tags will be fetched from the root level (e.g. all contact tags).
   */
  entityId?: string | undefined;
  operations: TagOperations;
  breadcrumbs?: BreadcrumbItem[];
  type?: 'contact' | 'response';
}

const props = defineProps<Props>();
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

// Wenn Breadcrumbs übergeben wurden, füge sie hinzu
if (props.breadcrumbs) {
  addBreadcrumb(computed(() => props.breadcrumbs!));
}

async function handleUpdateTag(tag: TagData, data: TagUpdateData) {
  const updatedTag = await props.operations.updateTag(
    props.entityId,
    tag.id,
    data
  );
  tags.value = tags.value.map((tag2) =>
    tag2.id === tag.id ? updatedTag : tag2
  );
}

async function handleDeleteTag(tag: TagData) {
  await props.operations.deleteTag(props.entityId, tag.id);
  tags.value = tags.value.filter((tag2) => tag2.id !== tag.id);
}

async function handleNewTag(data: TagUpdateData) {
  const tag = await props.operations.createTag(props.entityId, {
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
  tags.value = await props.operations.fetchTags(props.entityId);
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
