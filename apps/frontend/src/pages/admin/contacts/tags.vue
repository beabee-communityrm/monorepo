<route lang="yaml">
name: adminContactTags
meta:
  pageTitle: menu.contacts
  role: admin
</route>

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

import { createTag, deleteTag, fetchTags, updateTag } from '@utils/api/contact';

import { addBreadcrumb } from '@store/breadcrumb';

import type {
  CreateContactTagData,
  GetContactDataWith,
  GetContactTagData,
  UpdateContactTagData,
  GetContactWith,
} from '@beabee/beabee-common';

const props = defineProps<{
  contact: GetContactDataWith<GetContactWith.Profile>;
}>();

const { t } = useI18n();

const tags = ref<GetContactTagData[]>();
const formVisible = ref(false);

addBreadcrumb(computed(() => [{ title: t('tags.manageTags') }]));

async function handleUpdateTag(tagId: string, data: UpdateContactTagData) {
  const updatedTag = await updateTag(props.contact.id, tagId, data);
  tags.value = tags.value?.map((tag) => (tag.id === tagId ? updatedTag : tag));
}

async function handleDeleteTag(tagId: string) {
  await deleteTag(props.contact.id, tagId);
  tags.value = tags.value?.filter((tag) => tag.id !== tagId);
}

async function handleNewTag(data: CreateContactTagData) {
  const tag = await createTag(props.contact.id, data);
  tags.value?.push(tag);
  formVisible.value = false;
}

onBeforeMount(async () => {
  tags.value = await fetchTags(props.contact.id);
});
</script>
