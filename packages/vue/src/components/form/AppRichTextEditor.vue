<!--
  # AppRichTextEditor
  A rich text editor component built on top of TipTap editor with customizable toolbar controls.
  Supports bold, italic, underline, strikethrough, headings, lists, and links.

  ## Features:
  - Customizable toolbar (full or inline controls)
  - Accessible with ARIA labels and keyboard navigation
  - Copy functionality for content
  - Placeholder text support
  - Form validation integration
  - Responsive design
  - Disabled state support
  - Touch-friendly interface
-->
<template>
  <div :class="hasError && 'ProseMirror-hasError'">
    <AppLabel v-if="label" :label="label" :required="required" />

    <div
      v-if="editor"
      class="mb-2 flex flex-row gap-1"
      role="toolbar"
      :aria-label="t('form.richtext.toolbar')"
    >
      <AppRichTextEditorButton
        :icon="faBold"
        :title="t('form.richtext.bold')"
        :active="editor.isActive('bold')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleBold())"
      />
      <AppRichTextEditorButton
        :icon="faItalic"
        :title="t('form.richtext.italic')"
        :active="editor.isActive('italic')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleItalic())"
      />
      <AppRichTextEditorButton
        :icon="faUnderline"
        :title="t('form.richtext.underline')"
        :active="editor.isActive('underline')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleUnderline())"
      />
      <AppRichTextEditorButton
        :icon="faStrikethrough"
        :title="t('form.richtext.strikethrough')"
        :active="editor.isActive('strike')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleStrike())"
      />
      <template v-if="controls !== 'inline'">
        <AppRichTextEditorButton
          :icon="faHeading"
          :title="t('form.richtext.heading')"
          :active="editor.isActive('heading', { level: 3 })"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleHeading({ level: 3 }))"
        />
        <AppRichTextEditorButton
          :icon="faList"
          :title="t('form.richtext.bulletlist')"
          :active="editor.isActive('bulletList')"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleBulletList())"
        />
        <AppRichTextEditorButton
          :icon="faListOl"
          :title="t('form.richtext.numberedlist')"
          :active="editor.isActive('orderedList')"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleOrderedList())"
        />
      </template>
      <AppRichTextEditorButton
        :icon="faLink"
        :title="t('form.richtext.link')"
        :active="editor.isActive('link')"
        :disabled="disabled"
        @click="setLink"
      />
      <!-- Merge fields dropdown (only shown when mergeFields prop is provided) -->
      <div v-if="mergeFields" class="relative">
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
          <AppMergeFields :groups="mergeFields" @insert="insertMergeField" />
        </div>
      </div>
    </div>
    <div class="grid w-full">
      <div
        v-if="isEditorEmpty && placeholder"
        class="pointer-events-none invisible col-start-1 row-start-1 w-full self-start p-2"
        v-html="placeholder"
        aria-hidden="true"
      />
      <EditorContent
        :editor="editor"
        class="content-message z-0 col-start-1 row-start-1"
        :class="disabled && 'ProseMirror-disabled'"
        :aria-label="t('form.richtext.editor')"
      />
      <div
        v-if="isEditorEmpty && placeholder"
        class="pointer-events-none z-10 col-start-1 row-start-1 w-full self-start p-2 text-grey-dark"
        v-html="placeholder"
        aria-hidden="true"
      />
      <div
        v-if="copyable"
        class="z-20 col-start-1 row-start-1 self-start justify-self-end pr-1 pt-1"
      >
        <AppCopyButton variant="float" :text="editor?.getHTML() || ''" />
      </div>
    </div>
    <AppInputError v-if="hasError" :message="validation.$errors[0].$message" />
    <AppInputHelp v-if="infoMessage" :message="infoMessage" />
  </div>
</template>

<script lang="ts" setup>
/**
 * Rich text editor component with customizable toolbar.
 * Built on TipTap editor with accessibility and validation support.
 *
 * @component AppRichTextEditor
 */
import {
  faBold,
  faHeading,
  faItalic,
  faLink,
  faList,
  faListOl,
  faStrikethrough,
  faTag,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { type ChainedCommands, EditorContent, useEditor } from '@tiptap/vue-3';
import useVuelidate from '@vuelidate/core';
import { helpers, requiredIf } from '@vuelidate/validators';
import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MergeTagGroup } from '../../types/merge-fields';
import AppMergeFields from '../email/AppMergeFields.vue';
import { AppCopyButton, AppInputError, AppInputHelp, AppLabel } from '../index';
import AppRichTextEditorButton from './AppRichTextEditorButton.vue';

/**
 * Props for the AppRichTextEditor component
 */
export interface AppRichTextEditorProps {
  /** Current value of the editor (HTML content) */
  modelValue: string;
  /** Label for the editor */
  label?: string;
  /** Helper text displayed below the editor */
  infoMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether to show copy button */
  copyable?: boolean;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Controls displayed in toolbar */
  controls?: 'full' | 'inline';
  /** Optional merge field groups for email templates */
  mergeFields?: MergeTagGroup[];
}

const props = withDefaults(defineProps<AppRichTextEditorProps>(), {
  label: undefined,
  infoMessage: undefined,
  required: false,
  disabled: false,
  copyable: false,
  placeholder: undefined,
  controls: 'full',
  mergeFields: undefined,
});

/**
 * Events emitted by the AppRichTextEditor component
 */
const emit = defineEmits<{
  /**
   * Emitted when the editor content changes
   * @param value - The new HTML content
   */
  'update:modelValue': [value: string];
}>();

const { t } = useI18n();

// Merge fields dropdown state
const showMergeFieldsDropdown = ref(false);

const editor = useEditor({
  content: props.modelValue as string,
  extensions: [
    StarterKit.configure({
      blockquote: false,
      codeBlock: false,
      heading: { levels: [3] },
      horizontalRule: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
    }),
    Typography,
  ],
  editable: !props.disabled,
  enableInputRules: false,
  enablePasteRules: false,
  onUpdate: () => {
    if (editor.value) {
      emit(
        'update:modelValue',
        editor.value.isEmpty ? '' : editor.value.getHTML()
      );
    }
  },
  onBlur: () => validation.value.$touch(),
});

watch(toRef(props, 'modelValue'), (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value as string, false);
  }
});

watch(toRef(props, 'disabled'), (value) => {
  if (editor.value) {
    editor.value.setEditable(!value);
  }
});

const rules = computed(() => ({
  v: {
    required: helpers.withMessage(
      t('form.errors.unknown.required'),
      requiredIf(!!props.required)
    ),
  },
}));

const validation = useVuelidate(rules, { v: toRef(props, 'modelValue') });
const hasError = computed(() => validation.value.$errors.length > 0);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

/**
 * Runs a TipTap command on the editor
 */
function run(cb: (cmd: ChainedCommands) => ChainedCommands): void {
  if (editor.value && !props.disabled) cb(editor.value.chain().focus()).run();
}

/**
 * Opens link dialog and sets or removes link
 */
function setLink(): void {
  if (!editor.value || props.disabled) return;

  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('Set URL (blank to remove)', previousUrl);

  if (url === null) {
    return;
  }

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
  } else {
    editor.value
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }
}

/**
 * Toggle merge fields dropdown
 */
function toggleMergeFieldsDropdown(): void {
  if (!props.disabled) {
    showMergeFieldsDropdown.value = !showMergeFieldsDropdown.value;
  }
}

/**
 * Insert merge field tag into editor at cursor position
 */
function insertMergeField(tag: string): void {
  if (!editor.value || props.disabled) return;

  const mergeTag = `*|${tag}|*`;

  editor.value.chain().focus().insertContent(mergeTag).run();

  // Close the dropdown after insertion
  showMergeFieldsDropdown.value = false;
}

const isEditorEmpty = computed(() => editor.value?.isEmpty || false);
</script>

<style lang="postcss">
.ProseMirror {
  @apply h-full min-h-[5rem] w-full rounded border border-primary-40 bg-white p-2 focus:shadow-input focus:outline-none;

  .ProseMirror-hasError & {
    @apply border-danger-70 bg-danger-10;
  }
}

.ProseMirror-disabled .ProseMirror {
  @apply cursor-not-allowed border-primary-40 bg-grey-lighter opacity-60;
}
</style>
