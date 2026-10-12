<script lang="ts" setup>
import { reactive } from 'vue';

import AppCopyIconButton from './AppCopyIconButton.vue';

const state = reactive({
  text: 'Copy this text',
});
</script>

<template>
  <Story title="NuxtUi/AppCopyIconButton">
    <Variant title="Playground" :init-state="() => state">
      <template #default="{ state }">
        <AppCopyIconButton :text="state.text" />
      </template>

      <template #controls="{ state }">
        <HstText v-model="state.text" title="Text to Copy" />
      </template>
    </Variant>
  </Story>
</template>
