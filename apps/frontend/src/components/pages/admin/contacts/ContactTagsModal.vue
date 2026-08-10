<!--
  # ContactTagsModal
  Manages the organisation's contact tags: rename in place, delete, or add.

  Replaces the former /admin/contacts/tags page, so it's opened from the tag
  menus on the contact list.
-->
<template>
  <UModal
    v-model:open="open"
    :title="t('tags.manageTags')"
    :description="t('tags.manageTagsDescription-nuxt')"
  >
    <template #body>
      <div class="flex flex-col gap-2">
        <div v-for="tag in tags" :key="tag.id" class="flex items-center gap-2">
          <UInput
            :model-value="tag.name"
            variant="subtle"
            class="flex-1"
            @blur="handleRename(tag, $event)"
            @keyup.enter="($event.target as HTMLInputElement).blur()"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            class="hover:text-error"
            :aria-label="t('actions.delete')"
            @click="tagToDelete = tag"
          />
        </div>

        <p v-if="tags.length === 0" class="text-muted italic">
          {{ t('tags.noTags') }}
        </p>

        <form
          class="border-default mt-2 flex items-center gap-2 border-t pt-4"
          @submit.prevent="handleAdd"
        >
          <UInput
            v-model="newTagName"
            variant="subtle"
            class="flex-1"
            :placeholder="t('tags.newTagName-nuxt')"
          />
          <UButton
            type="submit"
            icon="i-lucide-plus"
            :disabled="!newTagName.trim()"
            :loading="saving"
          >
            {{ t('tagEditor.add') }}
          </UButton>
        </form>
      </div>
    </template>
  </UModal>

  <UModal
    :open="!!tagToDelete"
    :title="t('tagEditor.confirmDelete.title')"
    @update:open="(isOpen: boolean) => !isOpen && (tagToDelete = undefined)"
  >
    <template #body>
      <p>
        {{
          t('tagEditor.confirmDelete.text_contact', {
            tagName: tagToDelete?.name,
          })
        }}
      </p>
    </template>
    <template #footer>
      <AppModalActions
        :cancel-label="t('actions.noBack')"
        :confirm-label="t('actions.yesDelete')"
        confirm-color="error"
        :confirm-loading="saving"
        @cancel="tagToDelete = undefined"
        @confirm="handleDelete"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { TagGetData } from '@beabee/beabee-common';
import { AppModalActions, addNotification } from '@beabee/vue';

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { client } from '#utils/api';

const { t } = useI18n();

const emit = defineEmits<{
  /** Emitted whenever the tag list changed, so callers can refresh their copy */
  (event: 'updated'): void;
}>();

const open = defineModel<boolean>('open', { required: true });

const tags = ref<TagGetData[]>([]);
const tagToDelete = ref<TagGetData>();
const newTagName = ref('');
const saving = ref(false);

async function loadTags() {
  tags.value = await client.contact.tag.list();
}

async function handleRename(tag: TagGetData, event: FocusEvent) {
  const input = event.target as HTMLInputElement;
  const name = input.value.trim();

  if (!name || name === tag.name) {
    input.value = tag.name;
    return;
  }

  await client.contact.tag.update(undefined, tag.id, { name });
  await loadTags();
  emit('updated');
  addNotification({
    variant: 'success',
    title: t('tags.notifications.renamedTag-nuxt', { tag: name }),
  });
}

async function handleAdd() {
  const name = newTagName.value.trim();
  if (!name) return;

  saving.value = true;
  try {
    await client.contact.tag.create(undefined, { name, description: '' });
    newTagName.value = '';
    await loadTags();
    emit('updated');
    addNotification({
      variant: 'success',
      title: t('tags.notifications.createdTag-nuxt', { tag: name }),
    });
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  const tag = tagToDelete.value;
  if (!tag) return;

  saving.value = true;
  try {
    await client.contact.tag.delete(undefined, tag.id);
    tagToDelete.value = undefined;
    await loadTags();
    emit('updated');
    addNotification({
      variant: 'success',
      title: t('tags.notifications.deletedTag-nuxt', { tag: tag.name }),
    });
  } finally {
    saving.value = false;
  }
}

watch(open, (isOpen) => isOpen && loadTags(), { immediate: true });
</script>
