<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeading from '@components/AppHeading.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import AppButton from '@components/button/AppButton.vue';
import TagEditorForm from '@components/tag/TagEditorForm.vue';
import TagEditorItem from '@components/tag/TagEditorItem.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import type { BreadcrumbItem } from '@type';
import { TagOperations } from '@utils/api';
import type {
  TagData,
  TagCreateData,
  TagUpdateData,
} from '@beabee/beabee-common';

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
const formVisible = ref(false);

// Wenn Breadcrumbs übergeben wurden, füge sie hinzu
if (props.breadcrumbs) {
  addBreadcrumb(computed(() => props.breadcrumbs!));
}

async function handleUpdateTag(tagId: string, data: TagUpdateData) {
  const updatedTag = await props.operations.updateTag(
    props.entityId,
    tagId,
    data
  );
  tags.value = tags.value.map((tag) => (tag.id === tagId ? updatedTag : tag));
}

async function handleDeleteTag(tagId: string) {
  await props.operations.deleteTag(props.entityId, tagId);
  tags.value = tags.value.filter((tag) => tag.id !== tagId);
}

async function handleNewTag(data: TagCreateData) {
  const tag = await props.operations.createTag(props.entityId, data);
  tags.value.push(tag);
  formVisible.value = false;
}

onBeforeMount(async () => {
  tags.value = await props.operations.fetchTags(props.entityId);
});
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
    <div>
      <AppHeading>
        {{ t('tags.manageTags') }}
      </AppHeading>

      <TagEditorItem
        v-for="tag in tags"
        :key="tag.id"
        :tag="tag"
        :type="props.type"
        @update="(data: TagUpdateData) => handleUpdateTag(tag.id, data)"
        @delete="handleDeleteTag"
      />

      <div
        v-if="formVisible"
        class="rounded rounded-t-none border border-primary-20 bg-primary-10 p-4"
      >
        <AppSubHeading>
          {{ t('tagEditor.addNewTag') }}
        </AppSubHeading>
        <TagEditorForm @cancel="formVisible = false" @save="handleNewTag" />
      </div>
      <AppButton
        v-else
        class="w-full"
        variant="primaryOutlined"
        @click="formVisible = true"
      >
        {{ t('tagEditor.add') }}
      </AppButton>
    </div>
  </div>
</template>
