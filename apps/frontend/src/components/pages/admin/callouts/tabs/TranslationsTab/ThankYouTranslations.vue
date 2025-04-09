<template>
  <AppFormBox :title="t('callout.builder.tabs.endMessage.title')">
    <div v-if="endMessage.whenFinished === 'message'" class="space-y-6">
      <!-- Thank You Title -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">
          {{ t('callout.builder.tabs.endMessage.inputs.title.label') }}
        </label>

        <AppInput
          :model-value="getValue(endMessage.thankYouTitle, selectedLocale)"
          :placeholder="
            selectedLocale === defaultLocale
              ? ''
              : endMessage.thankYouTitle.default
          "
          :disabled="selectedLocale === defaultLocale"
          :copyable="selectedLocale === defaultLocale"
          @update:model-value="
            updateValue('thankYouTitle', selectedLocale, $event)
          "
        />
      </div>

      <!-- Thank You Text -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">
          {{ t('callout.builder.tabs.endMessage.inputs.text.label') }}
        </label>

        <RichTextEditor
          :model-value="getValue(endMessage.thankYouText, selectedLocale)"
          :placeholder="
            selectedLocale === defaultLocale
              ? ''
              : endMessage.thankYouText.default
          "
          :disabled="selectedLocale === defaultLocale"
          :copyable="selectedLocale === defaultLocale"
          @update:model-value="
            updateValue('thankYouText', selectedLocale, $event)
          "
        />
      </div>
    </div>

    <div v-else class="space-y-2">
      <!-- Thank You Redirect -->
      <label class="block text-sm font-medium">
        {{ t('callout.builder.tabs.endMessage.inputs.url.label') }}
      </label>

      <AppInput
        :model-value="getValue(endMessage.thankYouRedirect, selectedLocale)"
        :placeholder="
          selectedLocale === defaultLocale
            ? ''
            : endMessage.thankYouRedirect.default
        "
        :disabled="selectedLocale === defaultLocale"
        :copyable="selectedLocale === defaultLocale"
        @update:model-value="
          updateValue('thankYouRedirect', selectedLocale, $event)
        "
      />
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { LocaleProp } from '@type';
import type { EndMessageTabData } from '../ContentTab/SidebarTabContent/EndMessageTab.vue';
import AppInput from '@components/forms/AppInput.vue';
import { AppFormBox } from '@beabee/vue/components';
import RichTextEditor from '@components/rte/RichTextEditor.vue';

const props = defineProps<{
  defaultLocale: string;
  selectedLocale: string;
  endMessage: EndMessageTabData;
}>();

const { t } = useI18n();

// Get end message value for a specific locale
function getValue(prop: LocaleProp | undefined, locale: string): string {
  if (!prop) return '';

  if (locale === props.defaultLocale) {
    return prop.default || '';
  }

  return prop[locale] || '';
}

// Update end message value
function updateValue(
  field: 'thankYouTitle' | 'thankYouText' | 'thankYouRedirect',
  locale: string,
  value: string
): void {
  if (locale === props.defaultLocale) {
    // eslint-disable-next-line vue/no-mutating-props
    props.endMessage[field].default = value;
  } else {
    // eslint-disable-next-line vue/no-mutating-props
    props.endMessage[field][locale] = value;
  }
}
</script>
