<script lang="ts" setup>
import { logEvent } from 'histoire/client';
import { ref } from 'vue';

import type { MergeTagGroup } from '../../types/merge-fields';
import AppRichTextEditor from './AppRichTextEditor.vue';

const content = ref(
  '<p>This is some <strong>bold</strong> and <em>italic</em> text.</p>'
);
const emptyContent = ref('');
const requiredContent = ref('');
const emailContent = ref(
  '<p>Hello *|FNAME|*,</p><p>Thank you for your participation!</p>'
);

// Example merge field groups for email templates
const mergeFieldGroups: MergeTagGroup[] = [
  {
    key: 'contact',
    tags: [
      { tag: 'EMAIL', example: 'user@example.com' },
      { tag: 'NAME', example: 'John Doe' },
      { tag: 'FNAME', example: 'John' },
      { tag: 'LNAME', example: 'Doe' },
    ],
  },
  {
    key: 'magic',
    tags: [{ tag: 'RPLINK' }, { tag: 'LOGINLINK' }, { tag: 'SPLINK' }],
  },
  {
    key: 'template',
    tags: [
      { tag: 'MESSAGE' },
      { tag: 'CALLOUTTITLE', example: 'Community Survey 2024' },
      { tag: 'CALLOUTLINK' },
      { tag: 'SUPPORTEMAIL', example: 'support@example.com' },
    ],
  },
];

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

    <Variant title="With Merge Fields">
      <div class="p-4">
        <AppRichTextEditor
          v-model="emailContent"
          label="Email Content"
          :merge-fields="mergeFieldGroups"
          info-message="Click the @ button to insert merge fields"
          @update:model-value="onUpdate"
        />
        <div class="mt-4 rounded border border-grey-light bg-grey-lighter p-3">
          <p class="mb-2 text-sm font-semibold text-body">Current Content:</p>
          <code class="text-xs text-body-80">{{ emailContent }}</code>
        </div>
      </div>
    </Variant>
  </Story>
</template>
