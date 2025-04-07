<template>
  <AppFormBox :title="t('callout.builder.tabs.intro.label')">
    <div class="space-y-2">
      <RichTextEditor
        :model-value="getValue(selectedLocale)"
        :placeholder="selectedLocale === defaultLocale ? '' : introText.default"
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

const props = defineProps<{
  introText: LocaleProp;
  defaultLocale: string;
  selectedLocale: string;
}>();

const { t } = useI18n();

// Get intro text value for a specific locale
function getValue(locale: string): string {
  if (!props.introText) return '';

  if (locale === props.defaultLocale) {
    return props.introText.default || '';
  }

  return props.introText[locale] || '';
}

// Update intro text value
function updateValue(locale: string, value: string): void {
  if (locale === props.defaultLocale) {
    // eslint-disable-next-line vue/no-mutating-props
    props.introText.default = value;
  } else {
    // eslint-disable-next-line vue/no-mutating-props
    props.introText[locale] = value;
  }
}
</script>
