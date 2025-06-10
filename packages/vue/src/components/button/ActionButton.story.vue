<script lang="ts" setup>
import {
  faClone,
  faDownload,
  faEdit,
  faEye,
  faHourglassEnd,
  faHourglassStart,
  faPencilAlt,
  faPlus,
  faTrash,
  faUpload,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { reactive } from 'vue';

import ActionButton from './ActionButton.vue';

const state = reactive({
  icon: faEdit,
  text: 'Edit Item',
});

const icons = {
  eye: faEye,
  pencil: faPencilAlt,
  clone: faClone,
  trash: faTrash,
  hourglassStart: faHourglassStart,
  hourglassEnd: faHourglassEnd,
  user: faUser,
  plus: faPlus,
  download: faDownload,
  upload: faUpload,
};

// Common actions including callout actions and other general actions
const commonActions = [
  // Callout actions
  { icon: faEye, text: 'View' },
  { icon: faPencilAlt, text: 'Edit' },
  { icon: faClone, text: 'Replicate' },
  { icon: faHourglassEnd, text: 'End Now' },
  { icon: faHourglassStart, text: 'Reopen' },
  { icon: faTrash, text: 'Delete' },
  // Other common actions
  { icon: faPlus, text: 'Add New' },
  { icon: faDownload, text: 'Download' },
  { icon: faUpload, text: 'Upload' },
];

// Callout actions subset for specific examples
const calloutActions = commonActions.slice(0, 6);
</script>

<template>
  <Story title="Components/Button/ActionButton">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <ActionButton :icon="state.icon">
          {{ state.text }}
        </ActionButton>
      </div>

      <template #controls>
        <HstText v-model="state.text" title="Button Text" />
        <HstSelect
          v-model="state.icon"
          title="Icon"
          :options="
            Object.entries(icons).map(([key, value]) => ({ label: key, value }))
          "
        />
      </template>
    </Variant>

    <Variant title="Common Actions">
      <div class="flex flex-col gap-2">
        <ActionButton
          v-for="action in commonActions"
          :key="action.text"
          :icon="action.icon"
        >
          {{ action.text }}
        </ActionButton>
      </div>
    </Variant>
  </Story>
</template>
