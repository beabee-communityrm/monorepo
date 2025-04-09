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
                : slide.navigation.prevText.default
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
                : slide.navigation.nextText.default
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
                : slide.navigation.submitText.default
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
import { useI18n } from 'vue-i18n';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type/locale-prop';
import AppInput from '@components/forms/AppInput.vue';
import { AppFormBox } from '@beabee/vue/components';

const props = defineProps<{
  slides: FormBuilderSlide[];
  defaultLocale: string;
  selectedLocale: string;
}>();

const { t } = useI18n();

// Get navigation value for a specific locale
function getValue(navProp: LocaleProp, locale: string): string {
  if (locale === props.defaultLocale) {
    return navProp.default || '';
  }

  return navProp[locale] || '';
}
// Update navigation value
function updateValue(
  slide: FormBuilderSlide,
  field: 'prevText' | 'nextText' | 'submitText',
  locale: string,
  value: string
): void {
  const currentValue = { ...slide.navigation[field] };

  if (locale === props.defaultLocale) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  // Update the navigation field in the slide
  slide.navigation[field] = currentValue;
}
</script>
