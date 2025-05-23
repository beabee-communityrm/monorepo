<template>
  <AppFormBox :title="t('callout.builder.tabs.intro.label')">
    <div class="space-y-2">
      <RichTextEditor
        :model-value="getValue(selectedLocale)"
        :placeholder="introText.default"
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="updateValue(selectedLocale, $event)"
      />
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { LocaleProp } from '@type/locale-prop';
import { AppFormBox } from '@beabee/vue/components';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import { getLocalizedValue, updateLocalizedValue } from '@utils/callouts';

const props = defineProps<{
  introText: LocaleProp;
  defaultLocale: string;
  selectedLocale: string;
}>();

const { t } = useI18n();

// Get intro text value for a specific locale using utility function
function getValue(locale: string): string {
  return getLocalizedValue(props.introText, locale, props.defaultLocale);
}

// Update intro text value using utility function
function updateValue(locale: string, value: string): void {
  updateLocalizedValue(props.introText, locale, value, props.defaultLocale);
}
</script>
