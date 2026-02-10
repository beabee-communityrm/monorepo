<script lang="ts" setup>
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { logEvent } from 'histoire/client';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MergeTagGroup } from '../../types/merge-fields';
import { AppMergeFields, AppRichTextEditorButton } from '../index';
import AppRichTextEditor from './AppRichTextEditor.vue';

const content = ref(
  '<p>This is some <strong>bold</strong> and <em>italic</em> text.</p>'
);
const emptyContent = ref('');
const requiredContent = ref('');

const { t } = useI18n();

const mergeFieldsExample: MergeTagGroup[] = [
  {
    key: 'contact',
    tags: [
      { tag: 'FNAME', example: 'John' },
      { tag: 'LNAME', example: 'Doe' },
      { tag: 'EMAIL', example: 'john@example.com' },
    ],
  },
  {
    key: 'template',
    tags: [
      { tag: 'CALLOUTTITLE', example: 'My Callout' },
      { tag: 'CALLOUTLINK', example: 'https://example.com/callout' },
    ],
  },
];

const showMergeFieldsDropdown = ref(false);

function onUpdate(value: string) {
  logEvent('update:modelValue', { value });
}

function toggleMergeFieldsDropdown(): void {
  showMergeFieldsDropdown.value = !showMergeFieldsDropdown.value;
}

function insertMergeField(editor: any, tag: string): void {
  const mergeTag = `*|${tag}|*`;
  editor.chain().focus().insertContent(mergeTag).run();
  showMergeFieldsDropdown.value = false;
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
          v-model="content"
          label="Email Content with Merge Fields"
          info-message="Click the tag icon to insert merge fields"
          @update:model-value="onUpdate"
        >
          <template #toolbar="{ editor, disabled }">
            <div class="relative">
              <AppRichTextEditorButton
                :icon="faTag"
                :title="t('form.richtext.mergeFields')"
                :active="showMergeFieldsDropdown"
                :disabled="disabled"
                @click="toggleMergeFieldsDropdown"
              />
              <!-- Dropdown content -->
              <div
                v-if="showMergeFieldsDropdown"
                class="absolute right-0 top-full z-[100] mt-1 max-h-96 w-80 overflow-y-auto shadow-xl"
                @click.stop
              >
                <AppMergeFields
                  :groups="mergeFieldsExample"
                  @insert="(tag) => insertMergeField(editor, tag)"
                />
              </div>
            </div>
          </template>
        </AppRichTextEditor>
      </div>
    </Variant>

    <Variant title="Fill height (side-by-side)">
      <div class="flex h-80 gap-4 p-4">
        <AppRichTextEditor
          v-model="content"
          class="min-h-0 flex-1"
          label="Editor (fills height)"
          @update:model-value="onUpdate"
        />
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="mb-1 text-sm font-medium">Preview</span>
          <div
            class="min-h-0 flex-1 overflow-auto rounded border border-primary-40 bg-white p-4"
          >
            <div v-html="content" />
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
