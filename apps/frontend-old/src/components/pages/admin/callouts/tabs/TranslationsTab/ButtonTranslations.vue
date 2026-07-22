<template>
  <AppFormBox
    :title="t('callout.builder.tabs.translations.navigationButtons.title')"
  >
    <div v-for="(slide, slideIndex) in slides" :key="slide.id" class="mb-8">
      <h3 class="mb-4 font-semibold">
        {{
          t('callout.builder.navigation.slideNo', {
            no: slideIndex + 1,
          })
        }}:
        {{ slide.title }}
      </h3>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Back Button -->
        <div v-if="slideIndex > 0" class="space-y-2">
          <label class="block text-sm font-medium">
            {{ t('callout.builder.navigation.prevButton') }}
          </label>

          <AppInput
            :model-value="getValue(slide.navigation.prevText, selectedLocale)"
            :placeholder="
              selectedLocale === defaultLocale
                ? ''
                : getPlaceholder(slide.navigation.prevText, selectedLocale)
            "
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(slide, 'prevText', selectedLocale, $event)
            "
          />
        </div>

        <!-- Next Button -->
        <div v-if="slideIndex < slides.length - 1" class="space-y-2">
          <label class="block text-sm font-medium">
            {{ t('callout.builder.navigation.nextButton') }}
          </label>

          <AppInput
            :model-value="getValue(slide.navigation.nextText, selectedLocale)"
            :placeholder="
              selectedLocale === defaultLocale
                ? ''
                : getPlaceholder(slide.navigation.nextText, selectedLocale)
            "
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(slide, 'nextText', selectedLocale, $event)
            "
          />
        </div>

        <!-- Submit Button -->
        <div v-if="slideIndex === slides.length - 1" class="space-y-2">
          <label class="block text-sm font-medium">
            {{ t('callout.builder.navigation.submitButton') }}
          </label>

          <AppInput
            :model-value="getValue(slide.navigation.submitText, selectedLocale)"
            :placeholder="
              selectedLocale === defaultLocale
                ? ''
                : getPlaceholder(slide.navigation.submitText, selectedLocale)
            "
            :disabled="selectedLocale === defaultLocale"
            :copyable="selectedLocale === defaultLocale"
            @update:model-value="
              updateValue(slide, 'submitText', selectedLocale, $event)
            "
          />
        </div>
      </div>
    </div>
  </AppFormBox>
</template>

<script lang="ts" setup>
import { AppFormBox, AppInput } from '@beabee/vue';

import { useI18n } from 'vue-i18n';

import type { FormBuilderSlide } from '#components/form-builder/form-builder.interface';
import type { LocaleProp } from '#type/locale-prop';
import { getLocalizedValue, updateLocalizedValue } from '#utils/callouts';

const props = defineProps<{
  slides: FormBuilderSlide[];
  defaultLocale: string;
  selectedLocale: string;
}>();

const { t } = useI18n();

// Get navigation value for a specific locale using utility function (no fallback)
function getValue(navProp: LocaleProp, locale: string): string {
  return getLocalizedValue(navProp, locale, props.defaultLocale, {
    useFallback: false,
  });
}

// Get fallback text for placeholder
function getPlaceholder(navProp: LocaleProp, locale: string): string {
  return getLocalizedValue(navProp, locale, props.defaultLocale);
}

// Update navigation value using utility function
function updateValue(
  slide: FormBuilderSlide,
  field: 'prevText' | 'nextText' | 'submitText',
  locale: string,
  value: string
): void {
  updateLocalizedValue(
    slide.navigation[field],
    locale,
    value,
    props.defaultLocale
  );
}
</script>
