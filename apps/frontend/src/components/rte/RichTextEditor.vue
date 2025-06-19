<template>
  <div :class="hasError && 'ProseMirror-hasError'">
    <AppLabel v-if="label" :label="label" :required="required" />

    <div v-if="editor" class="mb-2 flex flex-row gap-1">
      <RichTextEditorButton
        :icon="faBold"
        :title="t('form.richtext.bold')"
        :active="editor.isActive('bold')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleBold())"
      />
      <RichTextEditorButton
        :icon="faItalic"
        :title="t('form.richtext.italic')"
        :active="editor.isActive('italic')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleItalic())"
      />
      <RichTextEditorButton
        :icon="faUnderline"
        :title="t('form.richtext.underline')"
        :active="editor.isActive('underline')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleUnderline())"
      />
      <RichTextEditorButton
        :icon="faStrikethrough"
        :title="t('form.richtext.strikethrough')"
        :active="editor.isActive('strike')"
        :disabled="disabled"
        @click="run((cmd) => cmd.toggleStrike())"
      />
      <template v-if="controls !== 'inline'">
        <RichTextEditorButton
          :icon="faHeading"
          :title="t('form.richtext.heading')"
          :active="editor.isActive('heading', { level: 3 })"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleHeading({ level: 3 }))"
        />
        <RichTextEditorButton
          :icon="faList"
          :title="t('form.richtext.bulletlist')"
          :active="editor.isActive('bulletList')"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleBulletList())"
        />
        <RichTextEditorButton
          :icon="faListOl"
          :title="t('form.richtext.numberedlist')"
          :active="editor.isActive('orderedList')"
          :disabled="disabled"
          @click="run((cmd) => cmd.toggleOrderedList())"
        />
      </template>
      <RichTextEditorButton
        :icon="faLink"
        :title="t('form.richtext.link')"
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
      />
      <div
        v-if="isEditorEmpty && placeholder"
        class="pointer-events-none absolute inset-2 text-grey-dark"
        v-html="placeholder"
      />
      <div v-if="copyable" class="absolute right-1 top-1">
        <AppCopyButton variant="float" :text="editor?.getHTML() || ''" />
      </div>
    </div>
    <AppInputError v-if="hasError" :message="validation.$errors[0].$message" />
    <AppInputHelp v-if="infoMessage" :message="infoMessage" />
  </div>
</template>

<script lang="ts" setup="{ emit }">
import { AppCopyButton, AppLabel } from '@beabee/vue/components';

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
import { useI18n } from 'vue-i18n';

import AppInputError from '../forms/AppInputError.vue';
import AppInputHelp from '../forms/AppInputHelp.vue';
import RichTextEditorButton from './RichTextEditorButton.vue';

const { t } = useI18n();

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue: string;
  label?: string;
  infoMessage?: string;
  required?: boolean;
  disabled?: boolean;
  copyable?: boolean;
  placeholder?: string;
  controls?: 'full' | 'inline';
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

function run(cb: (cmd: ChainedCommands) => ChainedCommands) {
  if (editor.value && !props.disabled) cb(editor.value.chain().focus()).run();
}

function setLink() {
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
