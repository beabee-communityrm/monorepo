<script lang="ts" setup>
import { reactive } from 'vue';

import AppModalDialog from './AppModalDialog.vue';
import AppModalActions from './AppModalActions.vue';

const state = reactive({
  open: false,
  icon: 'i-lucide-shield-check',
  iconColor: 'primary' as 'primary' | 'neutral' | 'error',
  title: 'Enable two-factor authentication',
  titleInBody: false,
  description: 'Step 1 of 2',
});
</script>

<template>
  <Story title="NuxtUi/AppModalDialog">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <UButton @click="state.open = true">Open modal</UButton>
        <AppModalDialog
          v-model:open="state.open"
          :icon="state.icon"
          :icon-color="state.iconColor"
          :title="state.title"
          :title-in-body="state.titleInBody"
          :description="state.description || undefined"
        >
          <p class="text-muted text-sm">Modal body content goes here.</p>

          <template #actions>
            <AppModalActions
              cancel-label="Cancel"
              confirm-label="Confirm"
              @cancel="state.open = false"
              @confirm="state.open = false"
            />
          </template>
        </AppModalDialog>
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.icon" title="Icon" />
        <HstSelect
          v-model="state.iconColor"
          title="Icon color"
          :options="['primary', 'neutral', 'error']"
        />
        <HstText v-model="state.title" title="Title" />
        <HstCheckbox v-model="state.titleInBody" title="Title in body" />
        <HstText v-model="state.description" title="Description" />
      </template>
    </Variant>
  </Story>
</template>
