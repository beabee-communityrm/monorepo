<!-- eslint-disable vue/no-mutating-props -->
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
      <AppScrollNavigation :sections="sections" />

      <!-- Main Content -->
      <div
        ref="contentRef"
        class="relative max-w-3xl flex-1 overflow-y-auto"
        style="contain: paint"
      >
        <!-- Language Settings Section -->
        <AppScrollSection id="language-settings">
          <AppFormBox
            :title="t('callout.builder.tabs.translations.language.title')"
          >
            <AppCheckboxGroup
              v-model="data.locales"
              :label="
                t('callout.builder.tabs.translations.language.enableLanguages')
              "
              :description="
                t('callout.builder.tabs.translations.language.description')
              "
              :options="availableLocaleItems"
              @update:model-value="handleLocalesChange"
            />
          </AppFormBox>
        </AppScrollSection>

        <div v-if="locales.length > 1" class="my-12">
          <!-- Language Tabs for all sections -->
          <AppTabCard
            v-model="selectedLocale"
            :items="localeItems"
            :sticky-tabs="true"
            variant="transparent"
          >
            <template #default="{ selected }">
              <!-- Title and Description Section -->
              <AppScrollSection id="title-description">
                <TitleAndDescriptionTranslations
                  :default-locale="defaultLocale"
                  :selected-locale="selected"
                  :title-and-image-data="props.tabs.titleAndImage.data"
                />
              </AppScrollSection>

              <!-- Buttons Section -->
              <AppScrollSection id="buttons">
                <ButtonTranslations
                  :slides="props.tabs.content.data.slides"
                  :default-locale="defaultLocale"
                  :selected-locale="selected"
                />
              </AppScrollSection>

              <!-- Introduction Section -->
              <AppScrollSection id="introduction">
                <IntroductionTranslations
                  :intro-text="
                    props.tabs.content.data.sidebarTabs.intro.introText
                  "
                  :default-locale="defaultLocale"
                  :selected-locale="selected"
                />
              </AppScrollSection>

              <!-- Slides Sections -->
              <template
                v-for="(slide, slideIndex) in props.tabs.content.data.slides"
                :key="slide.id"
              >
                <AppScrollSection :id="`slide-${slide.id}`">
                  <SlideTranslations
                    :slide="slide"
                    :slide-index="slideIndex"
                    :default-locale="defaultLocale"
                    :selected-locale="selected"
                    :component-text="data.componentText"
                  />
                </AppScrollSection>
              </template>

              <!-- Thank You Section -->
              <AppScrollSection id="thank-you">
                <ThankYouTranslations
                  :end-message="props.tabs.content.data.sidebarTabs.endMessage"
                  :default-locale="defaultLocale"
                  :selected-locale="selected"
                />
              </AppScrollSection>

              <!-- Response Links (Footer) Section -->
              <AppScrollSection id="response-links">
                <ResponseLinksTranslations
                  :response-links="
                    props.tabs.responseDisplay.data.responseLinks
                  "
                  :default-locale="defaultLocale"
                  :selected-locale="selected"
                  :response-link-text="data.responseLinkText"
                />
              </AppScrollSection>
            </template>
          </AppTabCard>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="flex-0 basis-[15rem] overflow-y-auto">
        <!-- Add right sidebar content here -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { LocaleContext } from '@beabee/locale';
import {
  AppCheckboxGroup,
  AppFormBox,
  AppNotification,
  AppScrollNavigation,
  AppScrollSection,
  AppTabCard,
  type ScrollSection,
  type TabItem,
  getLocaleItemsForContext,
} from '@beabee/vue';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '#store';
import type { LocaleProp } from '#type';

import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';
import ButtonTranslations from './TranslationsTab/ButtonTranslations.vue';
import IntroductionTranslations from './TranslationsTab/IntroductionTranslations.vue';
import ResponseLinksTranslations from './TranslationsTab/ResponseLinksTranslations.vue';
import SlideTranslations from './TranslationsTab/SlideTranslations.vue';
import ThankYouTranslations from './TranslationsTab/ThankYouTranslations.vue';
import TitleAndDescriptionTranslations from './TranslationsTab/TitleAndDescriptionTranslations.vue';

const allLocaleItems = getLocaleItemsForContext(LocaleContext.Callout);

/**
 * Data for the translations tab
 */
export interface TranslationsTabData {
  /** Available locales */
  locales: string[];
  /** Component text translations */
  componentText: Record<string, LocaleProp>;
  /** Response link label translations (editor-side LocaleProp map) */
  responseLinkText: Record<string, LocaleProp>;
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

// Status Indicators
const warnAboutEditing = computed(
  () => props.status === ItemStatus.Open || props.status === ItemStatus.Ended
);

// Get locales from settings tab, ensure default locale is included
const locales = computed<string[]>(() => {
  const settingsLocales = props.data.locales || [];
  // Add default locale if not already included
  if (!settingsLocales.includes(defaultLocale.value)) {
    return [defaultLocale.value, ...settingsLocales];
  }
  return settingsLocales;
});

// Filter out default locale and sort by label
const availableLocaleItems = computed(() => {
  return allLocaleItems
    .filter((item) => item.id !== defaultLocale.value)
    .sort((a, b) => a.label.localeCompare(b.label));
});

// Default locale is the system-wide default locale
const defaultLocale = computed(() => generalContent.value.locale || 'en');

// Currently selected locale tab
const selectedLocale = ref(locales.value[0] || defaultLocale.value);

// Convert locales to tab items
const localeItems = computed<TabItem[]>(() => {
  return [
    // Create a tab for the default locale first
    {
      id: defaultLocale.value,
      label:
        getLocaleLabel(defaultLocale.value) + ' (' + t('common.default') + ')',
    },
    // Add tabs for additional locales
    ...locales.value
      .filter((locale) => locale !== defaultLocale.value)
      .map((locale) => ({
        id: locale,
        label: getLocaleLabel(locale),
      })),
  ];
});

// Reference to the content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for the scroll navigation
const sections = computed<ScrollSection[]>(() => {
  const slidesSections = props.tabs.content.data.slides.map((slide, index) => ({
    id: `slide-${slide.id}`,
    label:
      t('callout.builder.navigation.slideNo', { no: index + 1 }) +
      ': ' +
      slide.title,
  }));

  return [
    {
      id: 'language-settings',
      label: t('callout.builder.tabs.translations.languageSettings.title'),
    },
    ...(props.data.locales.length > 0
      ? [
          {
            id: 'title-description',
            label: t('callout.builder.tabs.titleAndImage.title'),
          },
          {
            id: 'buttons',
            label: t(
              'callout.builder.tabs.translations.navigationButtons.title'
            ),
          },
          ...slidesSections,
          { id: 'introduction', label: t('callout.builder.tabs.intro.label') },
          {
            id: 'response-links',
            label: t('callout.builder.tabs.translations.responseLinks.title'),
          },
        ]
      : []),
  ];
});

// Helper function to get a human-readable locale name
function getLocaleLabel(locale: string): string {
  // Find the locale in allLocaleItems
  const localeItem = allLocaleItems.find((item) => item.id === locale);
  return localeItem ? localeItem.label : locale.toUpperCase();
}

// Handle locales change
function handleLocalesChange(newLocales: string[]): void {
  // Update the selected locale if it was removed
  if (
    selectedLocale.value !== defaultLocale.value &&
    !newLocales.includes(selectedLocale.value)
  ) {
    selectedLocale.value = defaultLocale.value;
  }

  // If a new locale was added, select it
  const addedLocales = newLocales.filter(
    (locale) =>
      !props.data.locales.includes(locale) && locale !== defaultLocale.value
  );

  if (addedLocales.length > 0) {
    selectedLocale.value = addedLocales[0];
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
