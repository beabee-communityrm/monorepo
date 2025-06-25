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
      :aria-label="toolbarAriaLabel"
    >
      <AppRichTextEditorButton
        :icon="faBold"
        :title="labels.bold"
        :active="editor.isActive('bold')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleBold())"
      />
      <AppRichTextEditorButton
        :icon="faItalic"
        :title="labels.italic"
        :active="editor.isActive('italic')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleItalic())"
      />
      <AppRichTextEditorButton
        :icon="faUnderline"
        :title="labels.underline"
        :active="editor.isActive('underline')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleUnderline())"
      />
      <AppRichTextEditorButton
        :icon="faStrikethrough"
        :title="labels.strikethrough"
        :active="editor.isActive('strike')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleStrike())"
      />
      <template v-if="controls !== 'inline'">
        <AppRichTextEditorButton
          :icon="faHeading"
          :title="labels.heading"
          :active="editor.isActive('heading', { level: 3 })"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleHeading({ level: 3 }))"
        />
        <AppRichTextEditorButton
          :icon="faList"
          :title="labels.bulletList"
          :active="editor.isActive('bulletList')"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleBulletList())"
        />
        <AppRichTextEditorButton
          :icon="faListOl"
          :title="labels.numberedList"
          :active="editor.isActive('orderedList')"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleOrderedList())"
        />
      </template>
      <AppRichTextEditorButton
        :icon="faLink"
        :title="labels.link"
        :active="editor.isActive('link')"
        :disabled="disabled"
        @click="setLink"
      />
    </div>
    <div class="relative">
      <EditorContent
        :editor="editor"
        class="content-message"
        :class="disabled && 'ProseMirror-disabled'"
        :aria-label="editorAriaLabel"
      />
      <div
        v-if="isEditorEmpty && placeholder"
        class="pointer-events-none absolute inset-2 text-grey-dark"
        v-html="placeholder"
        aria-hidden="true"
      />
      <div v-if="copyable" class="absolute right-1 top-1">
        <AppCopyButton
          variant="float"
          :text="editor?.getHTML() || ''"
          v-bind="copyButtonProps"
        />
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
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { type ChainedCommands, EditorContent, useEditor } from '@tiptap/vue-3';
import useVuelidate from '@vuelidate/core';
import { helpers, requiredIf } from '@vuelidate/validators';
import { computed, onBeforeUnmount, toRef, watch } from 'vue';

import { AppCopyButton, AppInputError, AppInputHelp, AppLabel } from '../index';
import AppRichTextEditorButton from './AppRichTextEditorButton.vue';

/**
 * Labels for the rich text editor toolbar buttons
 */
export interface RichTextEditorLabels {
  /** Bold button label */
  bold: string;
  /** Italic button label */
  italic: string;
  /** Underline button label */
  underline: string;
  /** Strikethrough button label */
  strikethrough: string;
  /** Heading button label */
  heading: string;
  /** Bullet list button label */
  bulletList: string;
  /** Numbered list button label */
  numberedList: string;
  /** Link button label */
  link: string;
}

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
  /** Labels for toolbar buttons (required for internationalization) */
  labels: RichTextEditorLabels;
  /** Required field validation error message */
  requiredErrorMessage?: string;
  /** ARIA label for the toolbar */
  toolbarAriaLabel?: string;
  /** ARIA label for the editor content area */
  editorAriaLabel?: string;
  /** Props for the copy button */
  copyButtonProps?: {
    copyButtonTitle?: string;
    successMessage?: string;
    errorMessage?: string;
    errorDescription?: string;
    removeAriaLabel?: string;
  };
}

const props = withDefaults(defineProps<AppRichTextEditorProps>(), {
  label: undefined,
  infoMessage: undefined,
  required: false,
  disabled: false,
  copyable: false,
  placeholder: undefined,
  controls: 'full',
  requiredErrorMessage: 'This field is required',
  toolbarAriaLabel: 'Text formatting toolbar',
  editorAriaLabel: 'Rich text editor',
  copyButtonProps: undefined,
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
      props.requiredErrorMessage,
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

const isEditorEmpty = computed(() => editor.value?.isEmpty || false);
</script>

<style lang="postcss">
.ProseMirror {
  @apply h-auto min-h-[5rem] w-full rounded border border-primary-40 bg-white p-2 focus:shadow-input focus:outline-none;

  .ProseMirror-hasError & {
    @apply border-danger-70 bg-danger-10;
  }
}

.ProseMirror-disabled .ProseMirror {
  @apply cursor-not-allowed border-primary-40 bg-grey-lighter opacity-60;
}
</style>
