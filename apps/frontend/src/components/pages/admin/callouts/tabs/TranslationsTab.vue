<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Status Notifications -->
    <div class="flex-none">
      <AppNotification
        v-if="warnAboutEditing"
        variant="warning"
        class="mb-4"
        :title="t('editCallout.warning')"
      />
    </div>

    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar with Scroll Navigation -->
      <AppScrollNavigation
        :sections="navigationSections"
        @section-change="onSectionChange"
      />

      <!-- Main Content -->
      <div ref="contentRef" class="flex-1 overflow-y-auto">
        <h2 class="mb-4 text-xl font-semibold">
          {{ t('calloutBuilder.translationsTitle') }}
        </h2>
        <p class="mb-4">
          {{ t('calloutBuilder.translationsText') }}
        </p>

        <div v-if="locales.length > 0">
          <!-- Language Tabs for all sections -->
          <AppTabCard
            v-model="selectedLocale"
            :items="localeItems"
            class="mb-8"
          >
            <template #default="{ selected }">
              <!-- Title and Description Section -->
              <AppScrollSection
                id="title-description"
                :title="t('createCallout.tabs.titleAndImage.title')"
                @mounted="registerSection"
              >
                <!-- Title -->
                <div class="mb-6 space-y-2">
                  <label class="block text-sm font-medium">
                    {{
                      t('createCallout.tabs.titleAndImage.inputs.title.label')
                    }}
                  </label>

                  <div
                    v-if="selected !== defaultLocale"
                    class="mb-1 flex-none text-sm text-body-60"
                  >
                    {{ titleAndImage.title.default }}
                  </div>

                  <AppInput
                    :model-value="getTitleValue('title', selected)"
                    :placeholder="
                      selected === defaultLocale
                        ? ''
                        : t('common.enterTranslation')
                    "
                    :disabled="selected === defaultLocale"
                    class="w-full"
                    @update:model-value="
                      updateTitleValue('title', selected, $event)
                    "
                  />
                </div>

                <!-- Description -->
                <div class="mb-6 space-y-2">
                  <label class="block text-sm font-medium">
                    {{
                      t(
                        'createCallout.tabs.titleAndImage.inputs.description.label'
                      )
                    }}
                  </label>

                  <div
                    v-if="selected !== defaultLocale"
                    class="mb-1 flex-none text-sm text-body-60"
                  >
                    {{ titleAndImage.description.default }}
                  </div>

                  <AppTextArea
                    :model-value="getTitleValue('description', selected)"
                    :placeholder="
                      selected === defaultLocale
                        ? ''
                        : t('common.enterTranslation')
                    "
                    :disabled="selected === defaultLocale"
                    rows="3"
                    class="w-full"
                    @update:model-value="
                      updateTitleValue('description', selected, $event)
                    "
                  />
                </div>

                <!-- Share Title (if overrideShare is true) -->
                <div v-if="titleAndImage.overrideShare" class="mb-6 space-y-2">
                  <label class="block text-sm font-medium">
                    {{
                      t(
                        'createCallout.tabs.titleAndImage.inputs.shareTitle.label'
                      )
                    }}
                  </label>

                  <div
                    v-if="selected !== defaultLocale"
                    class="mb-1 flex-none text-sm text-body-60"
                  >
                    {{ titleAndImage.shareTitle.default }}
                  </div>

                  <AppInput
                    :model-value="getTitleValue('shareTitle', selected)"
                    :placeholder="
                      selected === defaultLocale
                        ? ''
                        : t('common.enterTranslation')
                    "
                    :disabled="selected === defaultLocale"
                    class="w-full"
                    @update:model-value="
                      updateTitleValue('shareTitle', selected, $event)
                    "
                  />
                </div>

                <!-- Share Description (if overrideShare is true) -->
                <div v-if="titleAndImage.overrideShare" class="mb-6 space-y-2">
                  <label class="block text-sm font-medium">
                    {{
                      t(
                        'createCallout.tabs.titleAndImage.inputs.shareDescription.label'
                      )
                    }}
                  </label>

                  <div
                    v-if="selected !== defaultLocale"
                    class="mb-1 flex-none text-sm text-body-60"
                  >
                    {{ titleAndImage.shareDescription.default }}
                  </div>

                  <AppTextArea
                    :model-value="getTitleValue('shareDescription', selected)"
                    :placeholder="
                      selected === defaultLocale
                        ? ''
                        : t('common.enterTranslation')
                    "
                    :disabled="selected === defaultLocale"
                    rows="3"
                    class="w-full"
                    @update:model-value="
                      updateTitleValue('shareDescription', selected, $event)
                    "
                  />
                </div>
              </AppScrollSection>

              <!-- Buttons Section -->
              <AppScrollSection
                id="buttons"
                :title="t('calloutBuilder.navigationButtons')"
                @mounted="registerSection"
              >
                <div
                  v-for="(slide, slideIndex) in slides"
                  :key="slide.id"
                  class="mb-8"
                >
                  <h3 class="mb-4 font-title text-lg font-semibold">
                    {{ t('calloutBuilder.slideNo', { no: slideIndex + 1 }) }}:
                    {{ slide.title }}
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
                        {{ slide.navigation.prevText.default }}
                      </div>

                      <AppInput
                        :model-value="
                          getNavigationValue(
                            slide.navigation.prevText,
                            selected
                          )
                        "
                        :placeholder="
                          selected === defaultLocale
                            ? ''
                            : t('common.enterTranslation')
                        "
                        :disabled="selected === defaultLocale"
                        class="w-full"
                        @update:model-value="
                          updateNavigationValue(
                            slide,
                            'prevText',
                            selected,
                            $event
                          )
                        "
                      />
                    </div>

                    <!-- Next Button -->
                    <div
                      v-if="slideIndex < slides.length - 1"
                      class="space-y-2"
                    >
                      <label class="block text-sm font-medium">
                        {{ t('calloutBuilder.nextButton') }}
                      </label>

                      <div
                        v-if="selected !== defaultLocale"
                        class="mb-1 flex-none text-sm text-body-60"
                      >
                        {{ slide.navigation.nextText.default }}
                      </div>

                      <AppInput
                        :model-value="
                          getNavigationValue(
                            slide.navigation.nextText,
                            selected
                          )
                        "
                        :placeholder="
                          selected === defaultLocale
                            ? ''
                            : t('common.enterTranslation')
                        "
                        :disabled="selected === defaultLocale"
                        class="w-full"
                        @update:model-value="
                          updateNavigationValue(
                            slide,
                            'nextText',
                            selected,
                            $event
                          )
                        "
                      />
                    </div>

                    <!-- Submit Button -->
                    <div
                      v-if="slideIndex === slides.length - 1"
                      class="space-y-2"
                    >
                      <label class="block text-sm font-medium">
                        {{ t('calloutBuilder.submitButton') }}
                      </label>

                      <div
                        v-if="selected !== defaultLocale"
                        class="mb-1 flex-none text-sm text-body-60"
                      >
                        {{ slide.navigation.submitText.default }}
                      </div>

                      <AppInput
                        :model-value="
                          getNavigationValue(
                            slide.navigation.submitText,
                            selected
                          )
                        "
                        :placeholder="
                          selected === defaultLocale
                            ? ''
                            : t('common.enterTranslation')
                        "
                        :disabled="selected === defaultLocale"
                        class="w-full"
                        @update:model-value="
                          updateNavigationValue(
                            slide,
                            'submitText',
                            selected,
                            $event
                          )
                        "
                      />
                    </div>
                  </div>
                </div>
              </AppScrollSection>

              <!-- Introduction Section -->
              <AppScrollSection
                id="introduction"
                :title="t('createCallout.tabs.intro.label')"
                @mounted="registerSection"
              >
                <div class="space-y-2">
                  <div
                    v-if="selected !== defaultLocale"
                    class="mb-1 flex-none text-sm text-body-60"
                    v-html="introText.default"
                  ></div>

                  <RichTextEditor
                    :model-value="getIntroValue(selected)"
                    :placeholder="
                      selected === defaultLocale
                        ? ''
                        : t('common.enterTranslation')
                    "
                    :disabled="selected === defaultLocale"
                    @update:model-value="updateIntroValue(selected, $event)"
                  />
                </div>
              </AppScrollSection>

              <!-- Slides Sections -->
              <template v-for="(slide, slideIndex) in slides" :key="slide.id">
                <AppScrollSection
                  :id="`slide-${slide.id}`"
                  :title="
                    t('calloutBuilder.slideNo', { no: slideIndex + 1 }) +
                    ': ' +
                    slide.title
                  "
                  @mounted="registerSection"
                >
                  <div
                    v-for="component in slide.components"
                    :key="component.id"
                    class="mb-8 border-t border-t-primary-20 pt-6"
                  >
                    <h3 class="mb-2 font-title text-xl font-semibold">
                      {{ component.label }}
                    </h3>

                    <!-- Standard fields (label, description, placeholder) -->
                    <div
                      v-for="[field, fieldType] in fields"
                      :key="field"
                      class="mb-4"
                    >
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
                            getLocalizedValue(
                              component[field] as string,
                              selected
                            )
                          "
                          :placeholder="
                            selected === defaultLocale
                              ? ''
                              : t('common.enterTranslation')
                          "
                          :disabled="selected === defaultLocale"
                          class="w-full"
                          @update:model-value="
                            updateValue(
                              component[field] as string,
                              selected,
                              $event
                            )
                          "
                        />

                        <AppTextArea
                          v-else
                          :model-value="
                            getLocalizedValue(
                              component[field] as string,
                              selected
                            )
                          "
                          :placeholder="
                            selected === defaultLocale
                              ? ''
                              : t('common.enterTranslation')
                          "
                          :disabled="selected === defaultLocale"
                          rows="3"
                          class="w-full"
                          @update:model-value="
                            updateValue(
                              component[field] as string,
                              selected,
                              $event
                            )
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
                          {{
                            t('calloutBuilder.translationFields.option', {
                              n: i + 1,
                            })
                          }}
                        </label>

                        <div
                          v-if="selected !== defaultLocale"
                          class="mb-1 flex-none text-sm text-body-60"
                        >
                          {{ getDefaultText(value.label) }}
                        </div>

                        <AppInput
                          :model-value="
                            getLocalizedValue(value.label, selected)
                          "
                          :placeholder="
                            selected === defaultLocale
                              ? ''
                              : t('common.enterTranslation')
                          "
                          :disabled="selected === defaultLocale"
                          class="w-full"
                          @update:model-value="
                            updateValue(value.label, selected, $event)
                          "
                        />
                      </div>
                    </div>
                  </div>
                </AppScrollSection>
              </template>

              <!-- Thank You Section -->
              <AppScrollSection
                id="thank-you"
                :title="t('createCallout.tabs.endMessage.title')"
                @mounted="registerSection"
              >
                <div
                  v-if="endMessage.whenFinished === 'message'"
                  class="space-y-6"
                >
                  <!-- Thank You Title -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium">
                      {{ inputT('title.label') }}
                    </label>

                    <div
                      v-if="selected !== defaultLocale"
                      class="mb-1 flex-none text-sm text-body-60"
                    >
                      {{ endMessage.thankYouTitle.default }}
                    </div>

                    <AppInput
                      :model-value="
                        getEndMessageValue(endMessage.thankYouTitle, selected)
                      "
                      :placeholder="
                        selected === defaultLocale
                          ? ''
                          : t('common.enterTranslation')
                      "
                      :disabled="selected === defaultLocale"
                      class="w-full"
                      @update:model-value="
                        updateEndMessageValue('thankYouTitle', selected, $event)
                      "
                    />
                  </div>

                  <!-- Thank You Text -->
                  <div class="space-y-2">
                    <label class="block text-sm font-medium">
                      {{ inputT('text.label') }}
                    </label>

                    <div
                      v-if="selected !== defaultLocale"
                      class="mb-1 flex-none text-sm text-body-60"
                      v-html="endMessage.thankYouText.default"
                    ></div>

                    <RichTextEditor
                      :model-value="
                        getEndMessageValue(endMessage.thankYouText, selected)
                      "
                      :placeholder="
                        selected === defaultLocale
                          ? ''
                          : t('common.enterTranslation')
                      "
                      :disabled="selected === defaultLocale"
                      @update:model-value="
                        updateEndMessageValue('thankYouText', selected, $event)
                      "
                    />
                  </div>
                </div>

                <div v-else class="space-y-2">
                  <!-- Thank You Redirect -->
                  <label class="block text-sm font-medium">
                    {{ inputT('url.label') }}
                  </label>

                  <div
                    v-if="selected !== defaultLocale"
                    class="mb-1 flex-none text-sm text-body-60"
                  >
                    {{ endMessage.thankYouRedirect.default }}
                  </div>

                  <AppInput
                    :model-value="
                      getEndMessageValue(endMessage.thankYouRedirect, selected)
                    "
                    :placeholder="
                      selected === defaultLocale
                        ? ''
                        : t('common.enterTranslation')
                    "
                    :disabled="selected === defaultLocale"
                    class="w-full"
                    @update:model-value="
                      updateEndMessageValue(
                        'thankYouRedirect',
                        selected,
                        $event
                      )
                    "
                  />
                </div>
              </AppScrollSection>
            </template>
          </AppTabCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemStatus } from '@beabee/beabee-common';
import type { CalloutComponentSchema } from '@beabee/beabee-common';
import {
  AppNotification,
  AppScrollNavigation,
  AppScrollSection,
  AppTabCard,
  type ScrollSection,
  type TabItem,
} from '@beabee/vue/components';
import AppInput from '@components/forms/AppInput.vue';
import AppTextArea from '@components/forms/AppTextArea.vue';
import RichTextEditor from '@components/rte/RichTextEditor.vue';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type';
import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';
import type { EndMessageTabData } from '../tabs/ContentTab/SidebarTabContent/EndMessageTab.vue';
import { generalContent } from '@store';

/**
 * Data for the translations tab
 */
export interface TranslationsTabData {
  /** Component text translations */
  componentText: Record<string, LocaleProp>;
}

export interface TranslationsTabProps {
  /** The data for the translations tab */
  data: TranslationsTabData;
  /** Whether the tab is active */
  isActive: boolean;
  /** The status of the callout */
  status: ItemStatus | undefined;
  /** All tabs for the callout */
  tabs: CalloutHorizontalTabs;
}

const props = defineProps<TranslationsTabProps>();
const emit = defineEmits(['update:data', 'update:validated', 'update:error']);

const { t } = useI18n();
const inputT = (key: string) =>
  t('createCallout.tabs.endMessage.inputs.' + key);

// Status Indicators
const warnAboutEditing = computed(
  () => props.status === ItemStatus.Open || props.status === ItemStatus.Ended
);

// Get slides from content tab
const slides = computed<FormBuilderSlide[]>(
  () => props.tabs.content.data.slides || []
);

// Get intro text from content tab
const introText = computed<LocaleProp>(
  () => props.tabs.content.data.sidebarTabs.intro.introText
);

// Get end message from content tab
const endMessage = computed<EndMessageTabData>(
  () => props.tabs.content.data.sidebarTabs.endMessage
);

// Get title and image data from title and image tab
const titleAndImage = computed(() => props.tabs.titleAndImage.data);

// Get locales from settings tab, ensure default locale is included
const locales = computed<string[]>(() => {
  const settingsLocales = props.tabs.settings.data.locales || [];
  // Add default locale if not already included
  if (!settingsLocales.includes(defaultLocale.value)) {
    return [defaultLocale.value, ...settingsLocales];
  }
  return settingsLocales;
});

// Default locale is the system-wide default locale
const defaultLocale = computed(() => generalContent.value.locale || 'en');

// Currently selected locale tab
const selectedLocale = ref(locales.value[0] || defaultLocale.value);

// Convert locales to tab items
const localeItems = computed<TabItem[]>(() => {
  // Create a tab for the default locale first
  const items: TabItem[] = [
    {
      id: defaultLocale.value,
      label:
        getLocaleLabel(defaultLocale.value) + ' (' + t('common.default') + ')',
    },
  ];

  // Add tabs for additional locales
  locales.value.forEach((locale) => {
    if (locale !== defaultLocale.value) {
      items.push({
        id: locale,
        label: getLocaleLabel(locale),
      });
    }
  });

  return items;
});

// Field types mapping
const fields = [
  ['label', 'input'],
  ['description', 'textarea'],
  ['placeholder', 'input'],
] as const;

// Reference to the content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for the scroll navigation
const sections = ref<ScrollSection[]>([
  {
    id: 'title-description',
    label: t('createCallout.tabs.titleAndImage.title'),
  },
  { id: 'buttons', label: t('calloutBuilder.navigationButtons') },
  { id: 'introduction', label: t('createCallout.tabs.intro.label') },
]);

// Initialize sections based on slides
watch(
  slides,
  (newSlides) => {
    // Create sections for each slide
    const slidesSections = newSlides.map((slide, index) => ({
      id: `slide-${slide.id}`,
      label:
        t('calloutBuilder.slideNo', { no: index + 1 }) + ': ' + slide.title,
    }));

    // Update sections array
    sections.value = [
      {
        id: 'title-description',
        label: t('createCallout.tabs.titleAndImage.title'),
      },
      { id: 'buttons', label: t('calloutBuilder.navigationButtons') },
      { id: 'introduction', label: t('createCallout.tabs.intro.label') },
      ...slidesSections,
      { id: 'thank-you', label: t('createCallout.tabs.endMessage.title') },
    ];
  },
  { immediate: true }
);

// Computed sections for navigation
const navigationSections = computed(() => sections.value);

// Register a section element for scrolling
function registerSection(id: string, element: HTMLElement): void {
  const sectionIndex = sections.value.findIndex((s) => s.id === id);
  if (sectionIndex >= 0) {
    sections.value[sectionIndex].element = element;
  }
}

// Handle section change from navigation
function onSectionChange(): void {
  // This function can be used to perform additional actions when a section is selected
  // For now, we just rely on the ScrollNavigation component to handle scrolling
}

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

// Component text management
const componentText = computed({
  get: () => props.data.componentText,
  set: (value) => {
    emit('update:data', { ...props.data, componentText: value });
  },
});

// Get the default text for a field
function getDefaultText(ref: string | undefined = ''): string {
  if (!ref) return '';

  const value = componentText.value[ref];
  return value?.default || ref;
}

// Get the localized value for a specific locale
function getLocalizedValue(
  ref: string | undefined = '',
  locale: string
): string {
  if (!ref) return '';

  const value = componentText.value[ref];
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

  const currentValue = componentText.value[ref] || { default: ref };
  const newValue = { ...currentValue };

  if (locale === defaultLocale.value) {
    newValue.default = value;
  } else {
    newValue[locale] = value;
  }

  componentText.value = { ...componentText.value, [ref]: newValue };
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
  slide: FormBuilderSlide,
  field: 'prevText' | 'nextText' | 'submitText',
  locale: string,
  value: string
): void {
  const currentValue = { ...slide.navigation[field] };

  if (locale === defaultLocale.value) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  // Update the navigation field in the slide
  slide.navigation[field] = currentValue;
}

// Get intro text value for a specific locale
function getIntroValue(locale: string): string {
  if (!introText.value) return '';

  if (locale === defaultLocale.value) {
    return introText.value.default || '';
  }

  return introText.value[locale] || '';
}

// Update intro text value
function updateIntroValue(locale: string, value: string): void {
  if (!introText.value) return;

  const currentValue = { ...introText.value };

  if (locale === defaultLocale.value) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  // Update the intro text in the content tab
  // eslint-disable-next-line vue/no-mutating-props
  props.tabs.content.data.sidebarTabs.intro.introText = currentValue;
}

// Get end message value for a specific locale
function getEndMessageValue(
  prop: LocaleProp | undefined,
  locale: string
): string {
  if (!prop) return '';

  if (locale === defaultLocale.value) {
    return prop.default || '';
  }

  return prop[locale] || '';
}

// Update end message value
function updateEndMessageValue(
  field: 'thankYouTitle' | 'thankYouText' | 'thankYouRedirect',
  locale: string,
  value: string
): void {
  if (!endMessage.value) return;

  const currentValue = { ...endMessage.value[field] };

  if (locale === defaultLocale.value) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  // Update the end message in the content tab
  // eslint-disable-next-line vue/no-mutating-props
  props.tabs.content.data.sidebarTabs.endMessage[field] = currentValue;
}

// Get title and description value for a specific locale
function getTitleValue(
  field: 'title' | 'description' | 'shareTitle' | 'shareDescription',
  locale: string
): string {
  if (!titleAndImage.value[field]) return '';

  if (locale === defaultLocale.value) {
    return titleAndImage.value[field].default || '';
  }

  return titleAndImage.value[field][locale] || '';
}

// Update title and description value
function updateTitleValue(
  field: 'title' | 'description' | 'shareTitle' | 'shareDescription',
  locale: string,
  value: string
): void {
  const currentValue = { ...titleAndImage.value[field] };

  if (locale === defaultLocale.value) {
    currentValue.default = value;
  } else {
    currentValue[locale] = value;
  }

  // Update the title and image in the title and image tab
  // eslint-disable-next-line vue/no-mutating-props
  props.tabs.titleAndImage.data[field] = currentValue;
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

// Validation
watch(
  () => props.data,
  () => {
    // Simple validation - always valid for now
    emit('update:validated', true);
    emit('update:error', false);
  },
  { immediate: true, deep: true }
);
</script>
