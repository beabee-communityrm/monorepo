<template>
  <AppFormBox :title="t('callout.builder.tabs.intro.label')">
    <div class="space-y-2">
      <AppRichTextEditor
        :model-value="getValue(selectedLocale)"
        :placeholder="getPlaceholder()"
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="updateValue(selectedLocale, $event)"
      />
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { AppFormBox, AppRichTextEditor } from '@beabee/vue';

import type { LocaleProp } from '@type/locale-prop';
import {
  getLocalizedValueFallback,
  getLocalizedValueNoFallback,
  updateLocalizedValue,
} from '@utils/callouts';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  introText: LocaleProp;
  defaultLocale: string;
  selectedLocale: string;
}>();

const { t } = useI18n();

// Get intro text value for a specific locale using utility function (no fallback)
function getValue(locale: string): string {
  return getLocalizedValueNoFallback(
    props.introText,
    locale,
    props.defaultLocale
  );
}

// Get fallback text for placeholder
function getPlaceholder(): string {
  return getLocalizedValueFallback(
    props.introText,
    props.selectedLocale,
    props.defaultLocale
  );
}

// Update intro text value using utility function
function updateValue(locale: string, value: string): void {
  updateLocalizedValue(props.introText, locale, value, props.defaultLocale);
}
</script>
