<script lang="ts" setup>
import { logEvent } from 'histoire/client';
import { ref } from 'vue';

import AppRichTextEditor from './AppRichTextEditor.vue';

const content = ref(
  '<p>This is some <strong>bold</strong> and <em>italic</em> text.</p>'
);
const emptyContent = ref('');
const requiredContent = ref('');

function onUpdate(value: string) {
  logEvent('update:modelValue', { value });
}
</script>

<template>
  <Story
    title="Form/AppRichTextEditor"
    :layout="{ type: 'single', iframe: false }"
  >
    <Variant title="Default">
      <div class="p-4">
        <AppRichTextEditor
          v-model="content"
          label="Content"
          info-message="Enter your content here"
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>

    <Variant title="Required">
      <div class="p-4">
        <AppRichTextEditor
          v-model="requiredContent"
          label="Required Content"
          required
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>

    <Variant title="With Placeholder">
      <div class="p-4">
        <AppRichTextEditor
          v-model="emptyContent"
          label="Content with Placeholder"
          placeholder="Start typing your content..."
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>

    <Variant title="Inline Controls">
      <div class="p-4">
        <AppRichTextEditor
          v-model="content"
          label="Inline Controls"
          controls="inline"
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>

    <Variant title="Disabled">
      <div class="p-4">
        <AppRichTextEditor
          v-model="content"
          label="Disabled Editor"
          disabled
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>

    <Variant title="With Copy Button">
      <div class="p-4">
        <AppRichTextEditor
          v-model="content"
          label="Copyable Content"
          copyable
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>
  </Story>
</template>
