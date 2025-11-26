<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="relative flex-1 bg-white p-6 shadow-md">
      <div class="mx-auto max-h-full max-w-3xl overflow-y-auto">
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

        <!-- Email editor with server-side preview (merge fields resolved server-side) -->
        <div class="relative overflow-visible">
          <EmailEditor
            v-model:subject="emailData.subject"
            v-model:content="emailData.content"
            :merge-fields="{
              CALLOUTTITLE: props.tabs.titleAndImage.data.title.default,
              CALLOUTLINK: `${env.appUrl}/crowdnewsroom/${props.tabs.titleAndImage.data.slug}`,
            }"
            :always-stacked="true"
          />
        </div>
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

import EmailEditor from '@components/EmailEditor.vue';
import env from '@env';
import type { LocaleProp } from '@type';
import { computed, reactive, watch } from 'vue';
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
  /** Email main body content */
  emailContent: LocaleProp;
}

/**
 * Props for the EmailTab component
 */
export type EmailTabProps = SidebarTabProps<EmailTabData>;

const props = defineProps<EmailTabProps>();
const { t } = useI18n();

// Check if "Collect contact information" is enabled in the settings tab
const collectInfoEnabled = computed(() => props.tabs.settings.data.collectInfo);

// Create reactive email data that syncs with props.data
const emailData = reactive({
  subject:
    props.data.emailSubject.default ||
    t('callout.builder.tabs.email.subject.default'),
  content:
    props.data.emailContent.default ||
    t('callout.builder.tabs.email.body.default'),
});

/**
 * Bi-directional sync between local emailData and parent's reactive props.data
 *
 * Props mutation is intentionally used here because:
 * - Component is rendered dynamically via <component :is> with v-bind
 * - Parent passes reactive objects and expects these mutations
 * - Alternative solutions (defineModel, emit) don't work with dynamic components
 */
watch(
  emailData,
  (newValue) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailSubject.default = newValue.subject;
    // eslint-disable-next-line vue/no-mutating-props
    props.data.emailContent.default = newValue.content;
  },
  { deep: true }
);

// Watch props.data changes and sync to emailData
watch(
  () => [props.data.emailSubject.default, props.data.emailContent.default],
  ([subject, message]) => {
    // Use default translations if values are empty
    const defaultSubject =
      subject || t('callout.builder.tabs.email.subject.default');
    const defaultContent =
      message || t('callout.builder.tabs.email.body.default');

    emailData.subject = defaultSubject;
    emailData.content = defaultContent;

    // Update props with default values if they were empty
    if (!subject) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.emailSubject.default = defaultSubject;
    }
    if (!message) {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.emailContent.default = defaultContent;
    }
  },
  { immediate: true }
);
</script>
