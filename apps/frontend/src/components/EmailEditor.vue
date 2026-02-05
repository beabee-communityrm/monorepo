<template>
  <div>
    <AppSubHeading v-if="heading">{{ heading }}</AppSubHeading>
    <div
      class="relative mb-6 flex flex-col gap-6"
      :class="alwaysStacked ? '' : 'md:flex-row'"
    >
      <div class="relative min-w-0 flex-1">
        <div class="mb-4">
          <AppInput
            v-model="subject"
            :label="t('emailEditor.subject.label')"
            required
          />
        </div>
        <AppRichTextEditor
          v-model="content"
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

      <div class="w-full" :class="alwaysStacked ? '' : 'md:w-[600px]'">
        <template v-if="previewSelectorOptions.length > 0">
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
        <AppLabel :label="t('emailEditor.preview.label')" class="mb-0.5" />
        <div
          class="content-message rounded border border-primary-40 bg-white p-4"
        >
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
      </div>
    </div>
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
  AppInput,
  AppLabel,
  AppLoadingSpinner,
  AppMergeFields,
  AppRichTextEditor,
  AppRichTextEditorButton,
  AppSubHeading,
  ContactSelector,
  type MergeTagGroup,
  sanitizeHtml,
} from '@beabee/vue';

import { faTag } from '@fortawesome/free-solid-svg-icons';
import { currentUser, generalContent } from '@store';
import type { Editor } from '@tiptap/vue-3';
import type {
  EmailPreviewResult,
  EmailTemplateConfig,
} from '@type/email-editor';
import { client } from '@utils/api';
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const PREVIEW_DEBOUNCE_MS = 500;

const subject = defineModel<string>('subject', { default: '' });
const content = defineModel<string>('content', { default: '' });

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
  }>(),
  {
    heading: '',
    template: undefined,
    mergeFields: () => ({}),
    alwaysStacked: false,
    previewContactId: undefined,
    previewContactOptions: undefined,
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

function toggleMergeFieldsDropdown() {
  showMergeFieldsDropdown.value = !showMergeFieldsDropdown.value;
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
