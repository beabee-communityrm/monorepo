<script lang="ts" setup>
import { reactive } from 'vue';

import ActionButton from './ActionButton.vue';

const state = reactive({
  icon: 'fa6-solid:pen-to-square',
  text: 'Edit Item',
});

const icons: Record<string, string> = {
  eye: 'fa6-solid:eye',
  pencil: 'fa6-solid:pencil',
  clone: 'fa6-solid:clone',
  trash: 'fa6-solid:trash',
  hourglassStart: 'fa6-solid:hourglass-start',
  hourglassEnd: 'fa6-solid:hourglass-end',
  user: 'fa6-solid:user',
  plus: 'fa6-solid:plus',
  download: 'fa6-solid:download',
  upload: 'fa6-solid:upload',
};

const commonActions = [
  { icon: 'fa6-solid:eye', text: 'View' },
  { icon: 'fa6-solid:pencil', text: 'Edit' },
  { icon: 'fa6-solid:clone', text: 'Replicate' },
  { icon: 'fa6-solid:hourglass-end', text: 'End Now' },
  { icon: 'fa6-solid:hourglass-start', text: 'Reopen' },
  { icon: 'fa6-solid:trash', text: 'Delete' },
  { icon: 'fa6-solid:plus', text: 'Add New' },
  { icon: 'fa6-solid:download', text: 'Download' },
  { icon: 'fa6-solid:upload', text: 'Upload' },
];
</script>

<template>
  <Story title="Button/ActionButton">
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
