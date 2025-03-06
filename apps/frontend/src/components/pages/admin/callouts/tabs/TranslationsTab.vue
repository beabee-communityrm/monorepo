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
      <!-- Left Sidebar -->
      <div class="flex-0 basis-menu overflow-y-auto">
        <!-- Slides List -->
        <div class="mb-4">
          <h2 class="mb-2 text-lg font-semibold">
            {{ t('calloutBuilder.slidesTitle') }}
          </h2>
          <div class="space-y-2">
            <button
              v-for="(slide, index) in slides"
              :key="slide.id"
              class="w-full rounded-md border px-3 py-2 text-left text-sm transition-colors"
              :class="
                currentSlideId === slide.id
                  ? 'border-primary bg-primary-5 font-medium text-primary'
                  : 'border-primary-20 hover:border-primary-40'
              "
              @click="currentSlideId = slide.id"
            >
              {{ t('calloutBuilder.slideNo', { no: index + 1 }) }}:
              {{ slide.title }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <h2 class="mb-4 text-xl font-semibold">
          {{ t('calloutBuilder.translationsTitle') }}
        </h2>
        <p class="mb-4">
          {{ t('calloutBuilder.translationsText') }}
        </p>

        <div v-if="currentSlide && locales.length > 0">
          <FormBuilderTranslationsTabCard
            v-model="componentText"
            :components="currentSlide.components"
            :locales="locales"
            :current-slide="currentSlide"
            :is-last-slide="isLastSlide"
            :intro-text="introText"
            :end-message="endMessage"
            @update:navigation="handleNavigationUpdate"
            @update:intro-text="handleIntroTextUpdate"
            @update:end-message="handleEndMessageUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemStatus } from '@beabee/beabee-common';
import AppNotification from '@beabee/vue/components/notification/AppNotification';
import FormBuilderTranslationsTabCard from '@components/form-builder/FormBuilderTranslationsTabCard.vue';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { LocaleProp } from '@type';
import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';
import type { EndMessageTabData } from '../tabs/ContentTab/SidebarTabContent/EndMessageTab.vue';

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

// Get locales from settings tab
const locales = computed<string[]>(
  () => props.tabs.settings.data.locales || []
);

// Current slide management
const currentSlideId = ref(slides.value.length > 0 ? slides.value[0].id : '');
const currentSlide = computed(() =>
  slides.value.find((slide) => slide.id === currentSlideId.value)
);

// Check if current slide is the last one
const currentSlideIndex = computed(() =>
  slides.value.findIndex((slide) => slide.id === currentSlideId.value)
);
const isLastSlide = computed(
  () => currentSlideIndex.value === slides.value.length - 1
);

// Component text management
const componentText = computed({
  get: () => props.data.componentText,
  set: (value) => {
    emit('update:data', { ...props.data, componentText: value });
  },
});

// Handle navigation update
function handleNavigationUpdate(
  field: 'prevText' | 'nextText' | 'submitText',
  value: LocaleProp
): void {
  if (currentSlide.value) {
    // Update the navigation field in the content tab
    currentSlide.value.navigation[field] = value;
  }
}

// Handle intro text update
function handleIntroTextUpdate(value: LocaleProp): void {
  // Update the intro text in the content tab
  // eslint-disable-next-line vue/no-mutating-props
  props.tabs.content.data.sidebarTabs.intro.introText = value;
}

// Handle end message update
function handleEndMessageUpdate(
  field: 'thankYouTitle' | 'thankYouText' | 'thankYouRedirect',
  value: LocaleProp
): void {
  // Update the end message in the content tab
  // eslint-disable-next-line vue/no-mutating-props
  props.tabs.content.data.sidebarTabs.endMessage[field] = value;
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

// Update current slide ID when slides change
watch(
  slides,
  (newSlides) => {
    if (
      newSlides.length > 0 &&
      !newSlides.some((s) => s.id === currentSlideId.value)
    ) {
      currentSlideId.value = newSlides[0].id;
    }
  },
  { immediate: true }
);
</script>
