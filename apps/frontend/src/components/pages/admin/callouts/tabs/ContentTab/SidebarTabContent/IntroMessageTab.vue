<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1">
    <div class="flex-1 overflow-y-auto bg-white p-6 shadow-md">
      <AppFormBox
        class="mx-auto max-w-3xl"
        :help="t('callout.builder.tabs.intro.help')"
      >
        <AppFormField>
          <RichTextEditor
            v-model="data.introText.default"
            :label="t('callout.builder.tabs.intro.label')"
            required
          />
        </AppFormField>
      </AppFormBox>
    </div>
    <!-- Right Sidebar -->
    <div class="flex-0 basis-[15rem] overflow-y-auto">
      <!-- TODO: Add right sidebar content here -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppFormField from '@beabee/vue/components/form/AppFormField';
import AppFormBox from '@beabee/vue/components/form/AppFormBox';
import RichTextEditor from '@components/rte/RichTextEditor.vue';

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
