<template>
  <div class="bg-grey-lighter p-4">
    <AppTabCard v-model="selectedLocale" :items="localeItems">
      <template #default="{ selected }">
        <!-- Navigation Buttons Section -->
        <div class="mb-8 border-b border-b-primary-20 pb-6">
          <h3 class="mb-4 font-title text-xl font-semibold">
            {{ t('calloutBuilder.navigationButtons') }}
          </h3>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <!-- Back Button -->
            <div class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('calloutBuilder.prevButton') }}
              </label>

              <div
                v-if="selected !== defaultLocale"
                class="mb-1 flex-none text-sm text-body-60"
              >
                {{ currentSlide.navigation.prevText.default }}
              </div>

              <AppInput
                :model-value="
                  getNavigationValue(currentSlide.navigation.prevText, selected)
                "
                :placeholder="
                  selected === defaultLocale ? '' : t('common.enterTranslation')
                "
                :disabled="selected === defaultLocale"
                class="w-full"
                @update:model-value="
                  updateNavigationValue('prevText', selected, $event)
                "
              />
            </div>

            <!-- Next Button -->
            <div v-if="!isLastSlide" class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('calloutBuilder.nextButton') }}
              </label>

              <div
                v-if="selected !== defaultLocale"
                class="mb-1 flex-none text-sm text-body-60"
              >
                {{ currentSlide.navigation.nextText.default }}
              </div>

              <AppInput
                :model-value="
                  getNavigationValue(currentSlide.navigation.nextText, selected)
                "
                :placeholder="
                  selected === defaultLocale ? '' : t('common.enterTranslation')
                "
                :disabled="selected === defaultLocale"
                class="w-full"
                @update:model-value="
                  updateNavigationValue('nextText', selected, $event)
                "
              />
            </div>

            <!-- Submit Button -->
            <div v-if="isLastSlide" class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('calloutBuilder.submitButton') }}
              </label>

              <div
                v-if="selected !== defaultLocale"
                class="mb-1 flex-none text-sm text-body-60"
              >
                {{ currentSlide.navigation.submitText.default }}
              </div>

              <AppInput
                :model-value="
                  getNavigationValue(
                    currentSlide.navigation.submitText,
                    selected
                  )
                "
                :placeholder="
                  selected === defaultLocale ? '' : t('common.enterTranslation')
                "
                :disabled="selected === defaultLocale"
                class="w-full"
                @update:model-value="
                  updateNavigationValue('submitText', selected, $event)
                "
              />
            </div>
          </div>
        </div>

        <!-- Intro Text Section -->
        <div v-if="introText" class="mb-8 border-b border-b-primary-20 pb-6">
          <h3 class="mb-4 font-title text-xl font-semibold">
            {{ t('createCallout.tabs.intro.label') }}
          </h3>

          <div class="space-y-2">
            <div
              v-if="selected !== defaultLocale"
              class="mb-1 flex-none text-sm text-body-60"
              v-html="introText.default"
            ></div>

            <RichTextEditor
              :model-value="getIntroValue(selected)"
              :placeholder="
                selected === defaultLocale ? '' : t('common.enterTranslation')
              "
              :disabled="selected === defaultLocale"
              @update:model-value="updateIntroValue(selected, $event)"
            />
          </div>
        </div>

        <!-- Form Components Section -->
        <div
          v-for="component in components"
          :key="component.id"
          class="mb-8 border-t border-t-primary-20 pt-6"
        >
          <h3 class="mb-2 font-title text-xl font-semibold">
            {{ component.label }}
          </h3>

          <!-- Standard fields (label, description, placeholder) -->
          <div v-for="[field, fieldType] in fields" :key="field" class="mb-4">
            <div v-if="component[field]" class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('calloutBuilder.translationFields.' + field) }}
              </label>

              <div
                v-if="selected !== defaultLocale"
                class="mb-1 flex-none text-sm text-body-60"
              >
                {{ getDefaultText(component[field] as string) }}
              </div>

              <AppInput
                v-if="fieldType === 'input'"
                :model-value="
                  getLocalizedValue(component[field] as string, selected)
                "
                :placeholder="
                  selected === defaultLocale ? '' : t('common.enterTranslation')
                "
                :disabled="selected === defaultLocale"
                class="w-full"
                @update:model-value="
                  updateValue(component[field] as string, selected, $event)
                "
              />

              <AppTextArea
                v-else
                :model-value="
                  getLocalizedValue(component[field] as string, selected)
                "
                :placeholder="
                  selected === defaultLocale ? '' : t('common.enterTranslation')
                "
                :disabled="selected === defaultLocale"
                rows="3"
                class="w-full"
                @update:model-value="
                  updateValue(component[field] as string, selected, $event)
                "
              />
            </div>
          </div>

          <!-- Options for select, radio, etc. -->
          <div
            v-for="(value, i) in getOptions(component)"
            :key="value.value"
            class="mb-4"
          >
            <div class="space-y-2">
              <label class="block text-sm font-medium">
                {{ t('calloutBuilder.translationFields.option', { n: i + 1 }) }}
              </label>

              <div
                v-if="selected !== defaultLocale"
                class="mb-1 flex-none text-sm text-body-60"
              >
                {{ getDefaultText(value.label) }}
              </div>

              <AppInput
                :model-value="getLocalizedValue(value.label, selected)"
                :placeholder="
                  selected === defaultLocale ? '' : t('common.enterTranslation')
                "
                :disabled="selected === defaultLocale"
                class="w-full"
                @update:model-value="updateValue(value.label, selected, $event)"
              />
            </div>
          </div>
        </div>
      </template>
    </AppTabCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CalloutComponentSchema } from '@beabee/beabee-common';
import { AppTabCard } from '@beabee/vue/components/tabs';
import type { TabItem } from '@beabee/vue/components/tabs';
import type { LocaleProp } from '@type';
import AppInput from '@components/forms/AppInput.vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import type { FormBuilderSlide } from './form-builder.interface';

const props = defineProps<{
  modelValue: Record<string, LocaleProp | undefined>;
  components: CalloutComponentSchema[];
  locales: string[];
  currentSlide: FormBuilderSlide;
  isLastSlide: boolean;
  introText?: LocaleProp;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, LocaleProp | undefined>): void;
  (
    e: 'update:navigation',
    field: 'prevText' | 'nextText' | 'submitText',
    value: LocaleProp
  ): void;
  (e: 'update:introText', value: LocaleProp): void;
}>();

const { t } = useI18n();

// Default locale is always the first one
const defaultLocale = computed(() => props.locales[0] || 'en');

// Currently selected locale tab
const selectedLocale = ref(defaultLocale.value);

// Convert locales to tab items
const localeItems = computed<TabItem[]>(() =>
  props.locales.map((locale) => ({
    id: locale,
    label: getLocaleLabel(locale),
  }))
);

// Field types mapping
const fields = [
  ['label', 'input'],
  ['description', 'textarea'],
  ['placeholder', 'input'],
] as const;

// Helper function to get a human-readable locale name
function getLocaleLabel(locale: string): string {
  const localeNames: Record<string, string> = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    pt: 'Português',
    it: 'Italiano',
    nl: 'Nederlands',
    // Add more as needed
  };

  return localeNames[locale] || locale.toUpperCase();
}

// Get the default text for a field
function getDefaultText(ref: string | undefined = ''): string {
  if (!ref) return '';

  const value = props.modelValue[ref];
  return value?.default || ref;
}

// Get the localized value for a specific locale
function getLocalizedValue(
  ref: string | undefined = '',
  locale: string
): string {
  if (!ref) return '';

  const value = props.modelValue[ref];
  if (!value) return '';

  if (locale === defaultLocale.value) {
    return value.default || ref;
  }

  return value[locale] || '';
}

// Update a translation value
function updateValue(
  ref: string | undefined = '',
  locale: string,
  value: string
): void {
  if (!ref) return;

  const currentValue = props.modelValue[ref] || { default: ref };
  const newValue = { ...currentValue };

  if (locale === defaultLocale.value) {
    newValue.default = value;
  } else {
    newValue[locale] = value;
  }

  emit('update:modelValue', { ...props.modelValue, [ref]: newValue });
}

// Get navigation value for a specific locale
function getNavigationValue(navProp: LocaleProp, locale: string): string {
  if (locale === defaultLocale.value) {
    return navProp.default || '';
  }

  return navProp[locale] || '';
}

// Update navigation value
function updateNavigationValue(
  field: 'prevText' | 'nextText' | 'submitText',
  locale: string,
  value: string
): void {
  const currentValue = { ...props.currentSlide.navigation[field] };

  if (locale === defaultLocale.value) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  emit('update:navigation', field, currentValue);
}

// Get intro text value for a specific locale
function getIntroValue(locale: string): string {
  if (!props.introText) return '';

  if (locale === defaultLocale.value) {
    return props.introText.default || '';
  }

  return props.introText[locale] || '';
}

// Update intro text value
function updateIntroValue(locale: string, value: string): void {
  if (!props.introText) return;

  const currentValue = { ...props.introText };

  if (locale === defaultLocale.value) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  emit('update:introText', currentValue);
}

// Get options for select, radio, etc. components
function getOptions(
  component: CalloutComponentSchema
): { label: string; value: string }[] {
  if (component.type === 'radio' || component.type === 'selectboxes') {
    return component.values;
  } else if (component.type === 'select') {
    return component.data.values;
  } else {
    return [];
  }
}
</script>
