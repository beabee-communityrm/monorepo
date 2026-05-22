<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="flex-1 overflow-y-auto bg-white p-6 shadow-md">
      <AppFormField
        :help="t('callout.builder.tabs.intro.help')"
        class="mx-auto max-w-3xl"
      >
        <AppRichTextEditor
          v-model="data.introText.default"
          :label="t('callout.builder.tabs.intro.label')"
          required
        />
      </AppFormField>
    </div>
    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto">
      <!-- TODO: Add right sidebar content here -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppFormField, AppRichTextEditor } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import type { LocaleProp } from '#type';

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
