<route lang="yaml">
name: adminCalloutViewResponsesTags
meta:
  pageTitle: menu.callouts
  role: admin
</route>

<template>
  <div class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
    <div>
      <AppHeading>
        {{ t('calloutResponsePage.manageTags') }}
      </AppHeading>

      <TagEditorItem
        v-for="tag in tags"
        :key="tag.id"
        :tag="tag"
        @update="(data) => handleUpdateTag(tag.id, data)"
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
<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeading from '@components/AppHeading.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import AppButton from '@components/button/AppButton.vue';
import TagEditorForm from '@components/tag/TagEditorForm.vue';
import TagEditorItem from '@components/tag/TagEditorItem.vue';

import { createTag, deleteTag, fetchTags, updateTag } from '@utils/api/callout';

import { addBreadcrumb } from '@store/breadcrumb';

import type {
  CreateCalloutTagData,
  GetCalloutDataWith,
  GetCalloutTagData,
  UpdateCalloutTagData,
} from '@type';

const props = defineProps<{
  callout: GetCalloutDataWith<'form'>;
}>();

const { t } = useI18n();

const tags = ref<GetCalloutTagData[]>();
const formVisible = ref(false);

addBreadcrumb(computed(() => [{ title: t('calloutResponsePage.manageTags') }]));

async function handleUpdateTag(tagId: string, data: UpdateCalloutTagData) {
  const updatedTag = await updateTag(props.callout.slug, tagId, data);
  tags.value = tags.value?.map((tag) => (tag.id === tagId ? updatedTag : tag));
}

async function handleDeleteTag(tagId: string) {
  await deleteTag(props.callout.slug, tagId);
  tags.value = tags.value?.filter((tag) => tag.id !== tagId);
}

async function handleNewTag(data: CreateCalloutTagData) {
  const tag = await createTag(props.callout.slug, data);
  tags.value?.push(tag);
  formVisible.value = false;
}

onBeforeMount(async () => {
  tags.value = await fetchTags(props.callout.slug);
});
</script>
