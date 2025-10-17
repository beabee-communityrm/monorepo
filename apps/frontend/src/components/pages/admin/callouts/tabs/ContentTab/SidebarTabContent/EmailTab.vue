<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="flex-1 overflow-y-auto bg-white p-6 shadow-md">
      <div class="mx-auto max-w-3xl">
        <!-- Info box when contact settings are not enabled -->
        <AppNotification
          v-if="!collectInfoEnabled"
          variant="warning"
          :title="t('callout.builder.tabs.email.collectInfoWarning.title')"
          class="mb-6"
        >
          <p>
            {{ t('callout.builder.tabs.email.collectInfoWarning.description') }}
          </p>
        </AppNotification>

        <!-- Toggle to enable/disable email -->
        <AppFormField class="mb-6">
          <AppToggleField
            v-model="data.sendEmail"
            variant="link"
            :label="t('callout.builder.tabs.email.sendEmail.label')"
            :description="t('callout.builder.tabs.email.sendEmail.description')"
            :disabled="!collectInfoEnabled"
          />
        </AppFormField>

        <!-- Email editor with server-rendered preview (merge fields resolved) -->
        <EmailEditor
          :email="emailData"
          :preview-content="emailPreview.content"
          :footer="emailFooter"
          :subject-label="t('callout.builder.tabs.email.subject.label')"
          :content-label="t('callout.builder.tabs.email.body.label')"
        />
      </div>
    </div>

    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto">
      <!-- Empty right sidebar -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppFormField, AppNotification, AppToggleField } from '@beabee/vue';

import EmailEditor from '@components/pages/admin/membership-builder/EmailEditor.vue';
import type { LocaleProp } from '@type';
import { client } from '@utils/api';
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the email tab in the sidebar
 */
export interface EmailTabData {
  /** Whether to send an email to participants after submission */
  sendEmail: boolean;
  /** Email subject line */
  emailSubject: LocaleProp;
  /** Email message content (used as MESSAGE merge field value) */
  emailMessage: LocaleProp;
}

/**
 * Props for the EmailTab component
 */
export type EmailTabProps = SidebarTabProps<EmailTabData>;

const props = defineProps<EmailTabProps>();
const { t } = useI18n();

// Check if "Collect contact information" is enabled in the settings tab
const collectInfoEnabled = computed(() => props.tabs.settings.data.collectInfo);

// Email footer for preview
const emailFooter = ref('');

// Create reactive email data that syncs with props.data
// Note: 'content' here represents the MESSAGE merge field value,
// not the complete rendered email body
const emailData = reactive({
  subject: props.data.emailSubject.default,
  content: props.data.emailMessage.default,
});

// Create reactive email preview data with merge fields replaced
// The server renders the template with all merge fields resolved
const emailPreview = reactive({
  subject: '',
  content: '',
});

// Function to load email preview with merge fields replaced
async function loadEmailPreview() {
  const preview = await client.email.preview(
    'contact',
    'callout-response-answers',
    {
      mergeFields: {
        MESSAGE: emailData.content,
        CALLOUTTITLE: props.tabs.titleAndImage.data.title.default,
        CALLOUTLINK: `${window.location.origin}/crowdnewsroom/example-callout`,
      },
      customSubject: emailData.subject,
    }
  );
  emailPreview.subject = preview.subject;
  emailPreview.content = preview.body;
}

// Watch emailData changes and sync to props.data
watch(
  emailData,
  (newValue) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailSubject.default = newValue.subject;
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailMessage.default = newValue.content;
    // Load preview with new data
    loadEmailPreview();
  },
  { deep: true }
);

// Watch props.data changes and sync to emailData
watch(
  () => [props.data.emailSubject.default, props.data.emailMessage.default],
  ([subject, message]) => {
    emailData.subject = subject;
    emailData.content = message;
    // Load preview with new data
    loadEmailPreview();
  }
);

// Load email footer and initial preview on component mount
onBeforeMount(async () => {
  emailFooter.value = (await client.content.get('email')).footer;
  await loadEmailPreview();
});
</script>
