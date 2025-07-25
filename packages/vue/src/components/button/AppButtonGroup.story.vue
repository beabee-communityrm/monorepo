<script lang="ts" setup>
import {
  faDownload,
  faEdit,
  faPlus,
  faTrash,
  faUpload,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import ActionButton from './ActionButton.vue';
import AppButton, { type ButtonVariant } from './AppButton.vue';
import AppButtonGroup from './AppButtonGroup.vue';

const variants: ButtonVariant[] = [
  'primary',
  'link',
  'danger',
  'primaryOutlined',
  'linkOutlined',
  'dangerOutlined',
  'dangerGhost',
  'greyOutlined',
];
</script>

<template>
  <Story title="Button/AppButtonGroup">
    <Variant title="Basic">
      <AppButtonGroup>
        <AppButton variant="primaryOutlined">Button 1</AppButton>
        <AppButton variant="primaryOutlined">Button 2</AppButton>
        <AppButton variant="primaryOutlined">Button 3</AppButton>
      </AppButtonGroup>
    </Variant>

    <Variant title="With Icons">
      <AppButtonGroup>
        <AppButton variant="primaryOutlined" :icon="faUser">User 1</AppButton>
        <AppButton variant="primaryOutlined" :icon="faUser">User 2</AppButton>
        <AppButton variant="primaryOutlined" :icon="faUser">User 3</AppButton>
      </AppButtonGroup>
    </Variant>

    <Variant title="Different Variants">
      <div class="flex flex-col gap-4">
        <div
          v-for="variant in variants"
          :key="variant"
          class="flex flex-col gap-1"
        >
          <span class="text-grey-500 text-sm">{{ variant }}</span>
          <AppButtonGroup>
            <AppButton :variant="variant">Left</AppButton>
            <AppButton :variant="variant">Middle</AppButton>
            <AppButton :variant="variant">Right</AppButton>
          </AppButtonGroup>
        </div>
      </div>
    </Variant>

    <Variant title="With Action Buttons">
      <AppButtonGroup>
        <ActionButton :icon="faEdit">Edit</ActionButton>
        <ActionButton :icon="faTrash">Delete</ActionButton>
        <ActionButton :icon="faPlus">Add</ActionButton>
      </AppButtonGroup>
    </Variant>

    <Variant title="Toolbar Example">
      <div class="rounded bg-grey-lighter p-4">
        <AppButtonGroup>
          <AppButton variant="primary" :icon="faPlus">New</AppButton>
          <AppButton variant="primaryOutlined" :icon="faEdit">Edit</AppButton>
          <AppButton variant="primaryOutlined" :icon="faDownload"
            >Download</AppButton
          >
          <AppButton variant="primaryOutlined" :icon="faUpload"
            >Upload</AppButton
          >
          <AppButton variant="danger" :icon="faTrash">Delete</AppButton>
        </AppButtonGroup>
      </div>
    </Variant>
  </Story>
</template>
