<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex h-full flex-col overflow-y-hidden">
    <AppFormSection>
      <!-- TODO: Change locale key path to calloutBuilder.intro.label -->
      <LocaleRichTextEditor
        v-model="data.introText"
        :locales="locales"
        :label="t('createCallout.tabs.titleAndImage.inputs.intro.label')"
        required
      />
    </AppFormSection>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppFormSection from '@components/forms/AppFormSection.vue';
import LocaleRichTextEditor from '@components/forms/LocaleRichTextEditor.vue';
import type { IntroMessageTabProps } from '../sidebar-tabs.interface';

interface Props {
  data: IntroMessageTabProps;
  locales: string[];
}

defineProps<Props>();
const { t } = useI18n();
</script>
