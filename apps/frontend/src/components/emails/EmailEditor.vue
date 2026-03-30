<template>
  <div>
    <AppSubHeading v-if="heading">{{ heading }}</AppSubHeading>

    <App2ColGrid extended :stack="alwaysStacked">
      <template #col1>
        <div class="flex h-full flex-col">
          <template v-if="showFromFields">
            <AppToggleField
              v-model="useCustomSender"
              :label="t('emailEditor.from.label')"
              class="flex-0 mb-4"
            />
            <div class="flex-0 mb-4">
              <AppInput
                v-model="effectiveFromName"
                :label="t('emailEditor.fromName.label')"
                :disabled="!useCustomSender"
                required
              />
            </div>
            <div class="flex-0 mb-4">
              <AppInput
                v-model="effectiveFromEmail"
                :label="t('emailEditor.fromEmail.label')"
                :disabled="!useCustomSender"
                type="email"
                required
              />
            </div>
          </template>
          <div class="flex-0 mb-4">
            <AppInput
              v-model="subject"
              :label="t('emailEditor.subject.label')"
              required
            />
          </div>
          <AppRichTextEditor
            v-model="content"
            class="flex-1"
            :label="t('emailEditor.body.label')"
            required
          >
            <template #toolbar="{ editor, disabled }">
              <div v-if="mergeFieldGroups" class="relative">
                <AppRichTextEditorButton
                  :icon="faTag"
                  :title="t('form.richtext.mergeFields')"
                  :active="showMergeFieldsDropdown"
                  :disabled="disabled"
                  @click="toggleMergeFieldsDropdown"
                />
                <div
                  v-if="showMergeFieldsDropdown"
                  class="absolute right-0 top-full z-[100] mt-1 max-h-96 w-80 overflow-y-auto shadow-xl"
                  @click.stop
                >
                  <AppMergeFields
                    :groups="mergeFieldGroups"
                    @insert="(tag) => insertMergeField(editor, tag)"
                  />
                </div>
              </div>
            </template>
          </AppRichTextEditor>
        </div>
      </template>

      <template #col2>
        <template v-if="previewSelectorOptions.length > 1">
          <AppLabel
            :label="t('emailEditor.preview.asContactLabel')"
            class="block"
          />
          <ContactSelector
            v-model="previewContactIdModel"
            :options="previewSelectorOptions"
            class="mb-3"
          />
        </template>
        <AppLabel :label="t('emailEditor.preview.label')" />
        <div
          class="content-message overflow-auto rounded border border-primary-40 bg-white p-4"
        >
          <p>
            <b>{{ t('emailEditor.preview.from') }}</b>
            {{ effectiveFromName }} &lt;{{ effectiveFromEmail }}&gt;
          </p>
          <p></p>
          <div
            v-if="!serverPreviewResult"
            class="flex min-h-[6rem] items-center justify-center p-8 text-body-80"
          >
            <AppLoadingSpinner
              :loading="isLoadingPreview"
              :message="t('common.loading')"
            />
            <span v-if="!isLoadingPreview">
              {{ t('emailEditor.preview.unavailable') }}
            </span>
          </div>
          <div v-else v-html="sanitizedPreviewBody" />
        </div>
      </template>
    </App2ColGrid>
  </div>
</template>
<script lang="ts" setup>
/**
 * EmailEditor: edit subject/body with server-side preview.
 * Preview includes merge field replacement, email footer and inline CSS.
 * Merge fields: template-specific (from API), contact fields (contact templates or when preview options set), standard (SUPPORTEMAIL, ORGNAME).
 */
import type { GetEmailTemplateInfoData } from '@beabee/beabee-common';
import { debounce } from '@beabee/beabee-common';
import type { PreviewEmailOptions } from '@beabee/client';
import {
  App2ColGrid,
  AppInput,
  AppLabel,
  AppLoadingSpinner,
  AppMergeFields,
  AppRichTextEditor,
  AppRichTextEditorButton,
  AppSubHeading,
  AppToggleField,
  ContactSelector,
  type MergeTagGroup,
  sanitizeHtml,
} from '@beabee/vue';

import { faTag } from '@fortawesome/free-solid-svg-icons';
import type { Editor } from '@tiptap/vue-3';
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { currentUser, generalContent } from '#store';
import type {
  EmailPreviewResult,
  EmailTemplateConfig,
} from '#type/email-editor';
import { client } from '#utils/api';

const PREVIEW_DEBOUNCE_MS = 500;

const fromName = defineModel<string | null>('fromName', { default: null });
const fromEmail = defineModel<string | null>('fromEmail', { default: null });
const subject = defineModel<string>('subject', { default: '' });
const content = defineModel<string>('content', { default: '' });

const useCustomSender = ref(fromName.value !== null);
const emailContent = ref({
  supportEmailName: '',
  supportEmail: '',
});

// Internal state to remember custom sender values
const customFromName = ref(fromName.value || '');
const customFromEmail = ref(fromEmail.value || '');

// Sync internal state with model values
watch(
  [useCustomSender, customFromName, customFromEmail],
  ([isCustom, name, email]) => {
    if (isCustom) {
      fromName.value = name;
      fromEmail.value = email;
    } else {
      fromName.value = null;
      fromEmail.value = null;
    }
  }
);

const effectiveFromName = computed({
  get: () =>
    useCustomSender.value
      ? customFromName.value
      : emailContent.value.supportEmailName,
  set: (value) => {
    if (useCustomSender.value) {
      customFromName.value = value;
    }
  },
});

const effectiveFromEmail = computed({
  get: () =>
    useCustomSender.value
      ? customFromEmail.value
      : emailContent.value.supportEmail,
  set: (value) => {
    if (useCustomSender.value) {
      customFromEmail.value = value;
    }
  },
});

const props = withDefaults(
  defineProps<{
    /** Optional heading above the editor. */
    heading?: string;
    /** Template type/id for preview and merge fields. */
    template?: EmailTemplateConfig;
    /** Override merge fields for preview. Format: { FIELD_NAME: 'value' }. */
    mergeFields?: Record<string, string>;
    /** If true, preview is always below the editor (no side-by-side on md+). */
    alwaysStacked?: boolean;
    /** Contact ID used for preview merge fields. Use with v-model:previewContactId and previewContactOptions. */
    previewContactId?: string | null;
    /** Extra contacts in the preview-as selector (e.g. segment send). Omit for template edit (current user only). */
    previewContactOptions?: PreviewContactOption[];
    /** Whether to show the from fields (sender name/email) */
    showFromFields?: boolean;
  }>(),
  {
    heading: '',
    template: undefined,
    mergeFields: () => ({}),
    alwaysStacked: false,
    previewContactId: undefined,
    previewContactOptions: undefined,
    showFromFields: false,
  }
);

export interface PreviewContactOption {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

const { t } = useI18n();

const templateInfoList = ref<GetEmailTemplateInfoData[]>([]);
const showMergeFieldsDropdown = ref(false);
const serverPreviewResult = ref<EmailPreviewResult | null>(null);
const isLoadingPreview = ref(false);

const previewContactIdModel = defineModel<string>('previewContactId', {
  default: '',
});

const effectivePreviewContactId = computed(
  () => previewContactIdModel.value || currentUser.value?.id || null
);

const previewSelectorOptions = computed(() =>
  props.previewContactOptions === undefined
    ? [{ id: '' }]
    : [{ id: '' }, ...props.previewContactOptions]
);

const mergeFieldGroups = computed<MergeTagGroup[]>(() => {
  const groups: MergeTagGroup[] = [];

  if (props.template?.id) {
    const templateInfo = templateInfoList.value.find(
      (info) => info.id === props.template?.id
    );
    if (templateInfo && templateInfo.mergeFields.length > 0) {
      groups.push({
        key: 'template',
        tags: templateInfo.mergeFields.map((field) => ({ tag: field })),
      });
    }
  }

  if (
    props.template?.type === 'contact' ||
    props.previewContactOptions !== undefined
  ) {
    const user = currentUser.value;
    const fullName = user
      ? `${user.firstname} ${user.lastname}`.trim()
      : undefined;

    groups.push({
      key: 'contact',
      tags: [
        { tag: 'EMAIL', example: user?.email },
        { tag: 'NAME', example: fullName },
        { tag: 'FNAME', example: user?.firstname },
        { tag: 'LNAME', example: user?.lastname },
      ],
    });
  }

  groups.push({
    key: 'standard',
    tags: [
      { tag: 'SUPPORTEMAIL', example: generalContent.value.supportEmail },
      { tag: 'ORGNAME', example: generalContent.value.organisationName },
    ],
  });

  return groups;
});

onMounted(async () => {
  try {
    templateInfoList.value = await client.email.template.list();
    emailContent.value = await client.content.get('email');
  } catch {
    // Merge fields limited if template list fails
  }
});

const sanitizedPreviewBody = computed(() =>
  sanitizeHtml(serverPreviewResult.value?.body)
);

async function fetchServerPreview() {
  isLoadingPreview.value = true;
  try {
    const previewOptions: PreviewEmailOptions = {
      subject: subject.value,
      body: content.value,
      contactId: effectivePreviewContactId.value ?? undefined,
      ...(Object.keys(props.mergeFields).length > 0 && {
        mergeFields: props.mergeFields,
      }),
    };
    const preview = props.template
      ? await client.email.template.preview(
          props.template.type,
          props.template.id,
          previewOptions
        )
      : await client.email.preview(previewOptions);
    if (!preview) {
      serverPreviewResult.value = null;
      return;
    }
    serverPreviewResult.value = {
      subject: preview.subject,
      body: preview.body,
    };
  } catch {
    serverPreviewResult.value = null;
  } finally {
    isLoadingPreview.value = false;
  }
}

function closeMergeFieldsDropdown() {
  showMergeFieldsDropdown.value = false;
}

function toggleMergeFieldsDropdown() {
  showMergeFieldsDropdown.value = !showMergeFieldsDropdown.value;
  if (showMergeFieldsDropdown.value) {
    // Defer so the current click event doesn't immediately close the dropdown
    setTimeout(() => {
      document.addEventListener('click', closeMergeFieldsDropdown, {
        once: true,
      });
    });
  }
}

function insertMergeField(editor: Editor, tag: string) {
  editor.chain().focus().insertContent(`*|${tag}|*`).run();
  showMergeFieldsDropdown.value = false;
}

const debouncedFetchServerPreview = debounce(
  fetchServerPreview,
  PREVIEW_DEBOUNCE_MS
);

watchEffect(() => {
  void subject.value;
  void content.value;
  void props.mergeFields;
  void effectivePreviewContactId.value;
  void debouncedFetchServerPreview();
});
</script>
