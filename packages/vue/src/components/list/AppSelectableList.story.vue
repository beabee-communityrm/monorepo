<script lang="ts" setup>
import {
  faFolder,
  faGlobe,
  faTag,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';

import AppSelectableList from './AppSelectableList.vue';

// Sample data for examples
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

// Track selected items for interactive examples
const selectedUserIds = ref<string[]>([]);
const selectedTagIds = ref<string[]>(['1']);
const selectedLanguageId = ref<string>('en');

// Handler functions
function handleUserSelect(
  user: { id: string; label: string },
  selected: boolean
) {
  if (selected) {
    selectedUserIds.value = selectedUserIds.value.filter(
      (id) => id !== user.id
    );
  } else {
    selectedUserIds.value.push(user.id);
  }
}

function handleTagSelect(
  tag: { id: string; label: string },
  selected: boolean
) {
  if (selected) {
    selectedTagIds.value = selectedTagIds.value.filter((id) => id !== tag.id);
  } else {
    selectedTagIds.value.push(tag.id);
  }
}

function handleLanguageSelect(
  language: { id: string; label: string },
  selected: boolean
) {
  // For single selection, we replace the current selection
  selectedLanguageId.value = selected ? '' : language.id;
}

// For logging actions
function logAction(item: { id: string; label: string }, selected: boolean) {
  console.log(`${selected ? 'Deselected' : 'Selected'}: ${item.label}`);
}
</script>

<template>
  <Story title="List/AppSelectableList">
    <Variant title="Basic">
      <div class="max-w-xs rounded border">
        <AppSelectableList
          v-slot="{ item }"
          :items="users"
          :selected-item-ids="selectedUserIds"
          @click="handleUserSelect"
        >
          {{ item.label }}
        </AppSelectableList>
      </div>
      <div class="mt-4 text-sm text-grey-dark">
        Selected users: {{ selectedUserIds.join(', ') || 'None' }}
      </div>
    </Variant>

    <Variant title="With Icons">
      <div class="max-w-xs rounded border">
        <AppSelectableList
          v-slot="{ item }"
          :items="tags"
          :selected-item-ids="selectedTagIds"
          @click="handleTagSelect"
        >
          <div class="flex items-center">
            <font-awesome-icon :icon="faTag" class="mr-2" />
            {{ item.label }}
          </div>
        </AppSelectableList>
      </div>
      <div class="mt-4 text-sm text-grey-dark">
        Selected tags: {{ selectedTagIds.join(', ') || 'None' }}
      </div>
    </Variant>

    <Variant title="Single Selection">
      <div class="max-w-xs rounded border">
        <AppSelectableList
          v-slot="{ item }"
          :items="languages"
          :selected-item-ids="[selectedLanguageId]"
          @click="handleLanguageSelect"
        >
          <div class="flex items-center">
            <font-awesome-icon :icon="faGlobe" class="mr-2" />
            {{ item.label }}
          </div>
        </AppSelectableList>
      </div>
      <div class="mt-4 text-sm text-grey-dark">
        Selected language: {{ selectedLanguageId || 'None' }}
      </div>
    </Variant>

    <Variant title="Disabled">
      <div class="max-w-xs rounded border">
        <AppSelectableList
          v-slot="{ item }"
          :items="buckets"
          :selected-item-ids="['inbox']"
          disabled
          @click="logAction"
        >
          <div class="flex items-center">
            <font-awesome-icon :icon="faFolder" class="mr-2" />
            {{ item.label }}
          </div>
        </AppSelectableList>
      </div>
    </Variant>

    <Variant title="Empty State">
      <div class="max-w-xs rounded border">
        <AppSelectableList
          v-slot="{ item }"
          :items="[] as Array<{ id: string; label: string }>"
          @click="logAction"
        >
          {{ item.label }}
        </AppSelectableList>
        <p class="p-3 italic text-grey-dark">No items available</p>
      </div>
    </Variant>
  </Story>
</template>
