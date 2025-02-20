<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex h-full flex-col overflow-y-hidden">
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
export interface IntroMessageTabProps {
  data: IntroMessageTabData;
  locales: string[];
}

defineProps<IntroMessageTabProps>();
const { t } = useI18n();
</script>
