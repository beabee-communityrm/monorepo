<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <AppFormBox class="flex-1 overflow-y-auto bg-white p-6 shadow-md">
      <!-- TODO: Move help text to the top; See draft -->
      <AppFormField
        class="mx-auto max-w-3xl"
        :help="t('createCallout.tabs.intro.help')"
      >
        <!-- TODO: Change locale key path to calloutBuilder.intro.label -->
        <LocaleRichTextEditor
          v-model="data.introText"
          :locales="locales"
          :label="t('createCallout.tabs.intro.label')"
          required
        />
      </AppFormField>
    </AppFormBox>
    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppFormField from '@components/forms/AppFormField.vue';
import LocaleRichTextEditor from '@components/forms/LocaleRichTextEditor.vue';

import type { LocaleProp } from '@type';
import type { SidebarTabProps } from '../SidebarTabs.interface';

/**
 * Data for the intro message tab in the sidebar
 */
export interface IntroMessageTabData {
  /** Intro text shown at the beginning of the form */
  introText: LocaleProp;
}

/**
 * Props for the IntroMessageTab component
 */
export type IntroMessageTabProps = SidebarTabProps<IntroMessageTabData>;

defineProps<IntroMessageTabProps>();
const { t } = useI18n();
</script>
