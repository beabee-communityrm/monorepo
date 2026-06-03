<script lang="ts" setup>
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import { AppSelectableList } from '../list';
import AppDropdownButton from './AppDropdownButton.vue';
import type { ButtonColor, ButtonVariant } from './AppButton.vue';

const state = reactive({
  icon: 'fa6-solid:user',
  title: 'Select User',
  color: 'primary' as ButtonColor,
  variant: 'outline' as ButtonVariant,
  showTitle: true,
  disabled: false,
});

const colors: ButtonColor[] = ['primary', 'link', 'danger', 'neutral'];
const variants: ButtonVariant[] = ['solid', 'outline', 'ghost'];

const icons: Record<string, string> = {
  user: 'fa6-solid:user',
  tag: 'fa6-solid:tag',
  folder: 'fa6-solid:folder',
  globe: 'fa6-solid:globe',
};

const users = [
  { id: '1', label: 'John Doe' },
  { id: '2', label: 'Jane Smith' },
  { id: '3', label: 'Alex Johnson' },
];

const tags = [
  { id: '1', label: 'Important' },
  { id: '2', label: 'Urgent' },
  { id: '3', label: 'Follow-up' },
];

const buckets = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'archived', label: 'Archived' },
];

const languages = [
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
];

const selectedUserId = ref<string | null>(null);
const selectedTagIds = ref<string[]>([]);
const currentBucket = ref('inbox');

function handleAssign(item: { id: string; label: string }, selected: boolean) {
  selectedUserId.value = selected ? null : item.id;
}

function handleToggleTag(
  item: { id: string; label: string },
  selected: boolean
) {
  if (selected) {
    selectedTagIds.value = selectedTagIds.value.filter((id) => id !== item.id);
  } else {
    selectedTagIds.value.push(item.id);
  }
}

function handleMoveBucket(item: { id: string; label: string }) {
  currentBucket.value = item.id;
}

function handleSelectLanguage(item: { id: string; label: string }) {
  state.title = item.label;
}
</script>

<template>
  <Story title="Button/AppDropdownButton">
    <Variant title="Playground">
      <AppDropdownButton
        :icon="state.icon"
        :title="state.title"
        :color="state.color"
        :variant="state.variant"
        :show-title="state.showTitle"
        :disabled="state.disabled"
      >
        <div class="p-4">
          <div class="cursor-pointer p-2 hover:bg-grey-lighter">User 1</div>
          <div class="cursor-pointer p-2 hover:bg-grey-lighter">User 2</div>
          <div class="cursor-pointer p-2 hover:bg-grey-lighter">User 3</div>
        </div>
      </AppDropdownButton>

      <template #controls>
        <HstText v-model="state.title" title="Button Title" />
        <HstSelect
          v-model="state.icon"
          title="Icon"
          :options="
            Object.entries(icons).map(([key, value]) => ({ label: key, value }))
          "
        />
        <HstSelect v-model="state.color" title="Color" :options="colors" />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstCheckbox v-model="state.showTitle" title="Show Title" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant title="Assign User Example">
      <AppDropdownButton
        icon="fa6-solid:user"
        title="Assign To"
        color="primary"
        variant="outline"
        show-title
      >
        <AppSelectableList
          v-slot="{ item }"
          :items="users"
          :selected-item-ids="selectedUserId ? [selectedUserId] : []"
          @click="handleAssign"
        >
          {{ item.label }}
        </AppSelectableList>
      </AppDropdownButton>
    </Variant>

    <Variant title="Tag Selection Example">
      <AppDropdownButton
        icon="fa6-solid:tag"
        title="Toggle Tags"
        color="primary"
        variant="outline"
        show-title
      >
        <p v-if="tags.length === 0" class="px-3 py-2 italic">
          No tags available
        </p>
        <AppSelectableList
          v-else
          v-slot="{ item }"
          :items="tags"
          :selected-item-ids="selectedTagIds"
          @click="handleToggleTag"
        >
          <font-awesome-icon :icon="['fas', 'tag']" class="mr-2" />{{
            item.label
          }}
        </AppSelectableList>
        <router-link
          class="block border-t border-primary-40 px-3 py-2 font-semibold text-primary underline hover:bg-primary-5"
          to="#"
        >
          <font-awesome-icon :icon="faCog" class="mr-2" />Manage Tags
        </router-link>
      </AppDropdownButton>
    </Variant>

    <Variant title="Move Bucket Example">
      <AppDropdownButton
        icon="fa6-solid:folder"
        title="Move to Bucket"
        color="primary"
        variant="outline"
        show-title
      >
        <AppSelectableList
          v-slot="{ item }"
          :items="buckets.filter((b) => b.id !== currentBucket)"
          @click="handleMoveBucket"
        >
          Move to {{ item.label }}
        </AppSelectableList>
      </AppDropdownButton>
    </Variant>

    <Variant title="Language Selection Example">
      <AppDropdownButton
        icon="fa6-solid:globe"
        title="English"
        color="neutral"
        variant="outline"
        show-title
      >
        <AppSelectableList
          v-slot="{ item }"
          :items="languages"
          @click="handleSelectLanguage"
        >
          <font-awesome-icon :icon="['fas', 'globe']" class="mr-2" />{{
            item.label
          }}
        </AppSelectableList>
      </AppDropdownButton>
    </Variant>
  </Story>
</template>
