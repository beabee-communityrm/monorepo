<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex max-h-full min-h-0 flex-1 flex-col">
    <AppFormSection>
      <!-- TODO: Change locale key path to calloutBuilder.intro.label -->
      <LocaleRichTextEditor
        v-model="data.introText"
        :locales="locales"
        :label="t('createCallout.tabs.intro.label')"
        required
      />
    </AppFormSection>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppFormSection from '@components/forms/AppFormSection.vue';
import LocaleRichTextEditor from '@components/forms/LocaleRichTextEditor.vue';
import type { LocaleProp } from '@type';
import type { SidebarTabProps } from '../SidebarTabsNavigation.vue';

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
