<script lang="ts" setup>
import { logEvent } from 'histoire/client';
import { ref } from 'vue';

import AppRichTextEditor from './AppRichTextEditor.vue';
import type { RichTextEditorLabels } from './AppRichTextEditor.vue';

const content = ref(
  '<p>This is some <strong>bold</strong> and <em>italic</em> text.</p>'
);
const emptyContent = ref('');
const requiredContent = ref('');

const labels: RichTextEditorLabels = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  heading: 'Heading',
  bulletList: 'Bullet List',
  numberedList: 'Numbered List',
  link: 'Link',
};

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
          :labels="labels"
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
          :labels="labels"
          required
          required-error-message="Content is required"
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>

    <Variant title="With Placeholder">
      <div class="p-4">
        <AppRichTextEditor
          v-model="emptyContent"
          label="Content with Placeholder"
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
          copyable
          @update:model-value="onUpdate"
        />
      </div>
    </Variant>
  </Story>
</template>
