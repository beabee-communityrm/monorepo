<script lang="ts" setup>
import {
  faCog,
  faFolder,
  faGlobe,
  faTag,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { reactive, ref } from 'vue';

import { AppSelectableList } from '../list';
import AppDropdownButton, {
  type DropdownButtonVariant,
} from './AppDropdownButton.vue';

const state = reactive({
  icon: faUser,
  title: 'Select User',
  variant: 'primaryOutlined' as DropdownButtonVariant,
  showTitle: true,
  disabled: false,
});

const variants: DropdownButtonVariant[] = [
  'primaryOutlined',
  'linkOutlined',
  'dangerOutlined',
  'greyOutlined',
];

const icons = {
  user: faUser,
  tag: faTag,
  folder: faFolder,
  globe: faGlobe,
};

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
const selectedUserId = ref<string | null>(null);
const selectedTagIds = ref<string[]>([]);
const currentBucket = ref('inbox');

// Handler functions
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
  // Just for demonstration
  state.title = item.label;
}
</script>

<template>
  <Story title="Button/AppDropdownButton">
    <Variant title="Playground">
      <div class="flex gap-4">
        <AppDropdownButton
          :icon="state.icon"
          :title="state.title"
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
      </div>

      <template #controls>
        <HstText v-model="state.title" title="Button Title" />
        <HstSelect
          v-model="state.icon"
          title="Icon"
          :options="
            Object.entries(icons).map(([key, value]) => ({ label: key, value }))
          "
        />
        <HstSelect
          v-model="state.variant"
          title="Variant"
          :options="variants"
        />
        <HstCheckbox v-model="state.showTitle" title="Show Title" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant title="Icon Only">
      <div class="flex gap-4">
        <AppDropdownButton
          :icon="faUser"
          title="Select User"
          variant="primaryOutlined"
        >
          <div class="p-4">
            <div class="cursor-pointer p-2 hover:bg-grey-lighter">User 1</div>
            <div class="cursor-pointer p-2 hover:bg-grey-lighter">User 2</div>
            <div class="cursor-pointer p-2 hover:bg-grey-lighter">User 3</div>
          </div>
        </AppDropdownButton>
      </div>
    </Variant>

    <Variant title="Assign User Example">
      <div class="flex gap-4">
        <AppDropdownButton
          :icon="faUser"
          title="Assign To"
          variant="primaryOutlined"
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
      </div>
    </Variant>

    <Variant title="Tag Selection Example">
      <div class="flex gap-4">
        <AppDropdownButton
          :icon="faTag"
          title="Toggle Tags"
          variant="primaryOutlined"
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
            <font-awesome-icon :icon="faTag" class="mr-2" />{{ item.label }}
          </AppSelectableList>

          <router-link
            class="block border-t border-primary-40 px-3 py-2 font-semibold text-primary underline hover:bg-primary-5"
            to="#"
          >
            <font-awesome-icon :icon="faCog" class="mr-2" />Manage Tags
          </router-link>
        </AppDropdownButton>
      </div>
    </Variant>

    <Variant title="Move Bucket Example">
      <div class="flex gap-4">
        <AppDropdownButton
          :icon="faFolder"
          title="Move to Bucket"
          variant="primaryOutlined"
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
      </div>
    </Variant>

    <Variant title="Language Selection Example">
      <div class="flex gap-4">
        <AppDropdownButton
          :icon="faGlobe"
          title="English"
          variant="greyOutlined"
          show-title
        >
          <AppSelectableList
            v-slot="{ item }"
            :items="languages"
            @click="handleSelectLanguage"
          >
            <font-awesome-icon :icon="faGlobe" class="mr-2" />{{ item.label }}
          </AppSelectableList>
        </AppDropdownButton>
      </div>
    </Variant>

    <Variant title="Different Variants">
      <div class="flex gap-4">
        <div>
          <AppDropdownButton
            v-for="variant in variants"
            :key="variant"
            :icon="faUser"
            :title="variant"
            :variant="variant"
            show-title
          >
            <div class="p-2">
              <div class="cursor-pointer p-2 hover:bg-grey-lighter">
                Option 1
              </div>
              <div class="cursor-pointer p-2 hover:bg-grey-lighter">
                Option 2
              </div>
              <div class="cursor-pointer p-2 hover:bg-grey-lighter">
                Option 3
              </div>
            </div>
          </AppDropdownButton>
        </div>
      </div>
    </Variant>
  </Story>
</template>
