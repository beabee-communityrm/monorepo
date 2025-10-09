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

      <AppNotification
        v-if="wasJustReplicated"
        variant="success"
        class="mb-4"
        :title="t('editCallout.replicated')"
      />
    </div>

    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar -->
      <div class="flex-0 basis-menu overflow-y-auto overflow-x-hidden">
        <!-- Form Builder Options -->
        <SidebarTabsNavigation
          v-model:selected-tab="selectedSidebarTab"
          :sidebar-tabs="sidebarTabs"
          :title="t('callout.builder.startEndScreenTitle')"
        />
        <!-- Slides Management -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ t('callout.builder.slidesTitle') }}
          </h2>
          <AppButton
            variant="primary"
            size="sm"
            :icon="faPlus"
            :title="t('callout.builder.actions.addSlide')"
            @click="handleAddSlide"
          >
            {{ t('callout.builder.actions.addSlide') }}
          </AppButton>
        </div>

        <Draggable v-model="slides" item-key="id">
          <template #item="{ element, index }">
            <CalloutSlideItem
              :slide-no="index"
              :slides="slides"
              :active="
                selectedSidebarTab === sidebarTabs.content.name &&
                currentSlideId === element.id
              "
              @select="handleSlideSelect"
              @remove="handleRemoveSlide"
            />
          </template>
        </Draggable>

        <template v-if="selectedSidebarTab === sidebarTabs.content.name">
          <!-- Slide Navigation -->
          <FormBuilderNavigation
            v-if="selectedSidebarTab === sidebarTabs.content.name"
            v-model="currentSlide.navigation"
            :slides="slides"
            :is-first="isFirstSlide"
            :is-last="isLastSlide"
          />
          <p class="text-sm text-grey">
            {{ t('common.id') }}: {{ currentSlide.id }}
          </p>
        </template>
      </div>

      <SidebarTabContent
        class="flex-1 gap-4"
        :slides="slides"
        :current-slide="currentSlide"
        :current-tab="currentSidebarTab"
        :status="status"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { AppButton, AppNotification } from '@beabee/vue';

import FormBuilderNavigation from '@components/form-builder/FormBuilderNavigation.vue';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getSlideSchema } from '@utils/callouts';
import useVuelidate from '@vuelidate/core';
import { computed, markRaw, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Draggable from 'vuedraggable';

import type { CalloutHorizontalTabs } from '../../CalloutHorizontalTabs.interface';
import CalloutSlideItem from './CalloutSlideItem.vue';
import {
  ContentFormTab,
  EmailTab,
  EndMessageTab,
  IntroMessageTab,
} from './SidebarTabContent';
import type { SidebarTabs, SidebarTabsData } from './SidebarTabs.interface';
import SidebarTabContent from './SidebarTabsContent.vue';
import SidebarTabsNavigation from './SidebarTabsNavigation.vue';

/**
 * Data for the content tab, which contains the form builder and end message configuration
 */
export interface ContentTabData {
  /** Form builder slides containing the form components */
  slides: FormBuilderSlide[];
  /** Configuration for the sidebar tabs within the content tab */
  sidebarTabs: SidebarTabsData;
}

export interface ContentTabProps {
  /** The data for the content tab */
  data: ContentTabData;
  /** The tabs for the callout */
  tabs: CalloutHorizontalTabs;
  /** The status of the callout */
  status: ItemStatus | undefined;
}

const props = defineProps<ContentTabProps>();

const emit = defineEmits(['update:error', 'update:validated']);
const { t } = useI18n();
const route = useRoute();

// State
const wasJustReplicated = computed(() => route.query.replicated !== undefined);
const validation = useVuelidate();

// Slides Management
const slides = computed({
  get: () => props.data.slides,
  // eslint-disable-next-line vue/no-mutating-props
  set: (v) => (props.data.slides = v),
});

const currentSlideId = ref(slides.value[0].id);
const currentSlideNo = computed({
  get: () => slides.value.findIndex((s) => s.id === currentSlideId.value),
  set: (v) => (currentSlideId.value = slides.value[v].id),
});

const currentSlide = computed(() => slides.value[currentSlideNo.value]);
const totalSlides = computed(() => slides.value.length);
const isFirstSlide = computed(() => currentSlideNo.value === 0);
const isLastSlide = computed(
  () => currentSlideNo.value === totalSlides.value - 1
);

// Status Indicators
const warnAboutEditing = computed(
  () => props.status === ItemStatus.Open || props.status === ItemStatus.Ended
);

// Sidebar Tabs
const sidebarTabs = reactive<SidebarTabs>({
  content: {
    name: t('callout.builder.tabs.content.title'),
    validated: false,
    error: false,
    component: markRaw(ContentFormTab),
    data: props.data.sidebarTabs.content,
  },
  intro: {
    name: t('callout.builder.tabs.intro.title'),
    validated: false,
    error: false,
    component: markRaw(IntroMessageTab),
    data: props.data.sidebarTabs.intro,
  },
  endMessage: {
    name: t('callout.builder.tabs.endMessage.title'),
    validated: false,
    error: false,
    component: markRaw(EndMessageTab),
    data: props.data.sidebarTabs.endMessage,
  },
  email: {
    name: t('callout.builder.tabs.email.title'),
    validated: false,
    error: false,
    component: markRaw(EmailTab),
    data: props.data.sidebarTabs.email,
  },
});

const selectedSidebarTab = ref(sidebarTabs.content.name);

// Computed the current sidebar tab
const currentSidebarTab = computed(() => {
  const tab = Object.entries(sidebarTabs).find(
    ([, tab]) => tab.name === selectedSidebarTab.value
  );
  return tab ? tab[1] : sidebarTabs.content;
});

// Methods
function handleAddSlide() {
  slides.value.push(getSlideSchema(totalSlides.value + 1));
  currentSlideNo.value = slides.value.length - 1;
}

function handleRemoveSlide(slideNo: number) {
  slides.value.splice(slideNo, 1);
  currentSlideNo.value = Math.max(0, currentSlideNo.value - 1);
}

/**
 * Handle slide selection and reset to default tab
 */
const handleSlideSelect = (slideId: string) => {
  currentSlideId.value = slideId;
  selectedSidebarTab.value = sidebarTabs.content.name;
};

// Watchers
watch(
  [validation, slides],
  () => {
    emit('update:error', validation.value.$errors.length > 0);
    emit(
      'update:validated',
      !validation.value.$invalid &&
        slides.value.every(
          (s, i) =>
            s.title &&
            s.components.length > 0 &&
            (i < totalSlides.value - 1
              ? s.navigation.nextText
              : s.navigation.submitText)
        )
    );
  },
  { immediate: true }
);

watch(
  () => currentSlide.value.components,
  (components) => {
    if (components.length > 0) {
      const firstComponentWithLabel = components.find((component) =>
        component.label?.trim()
      );

      if (firstComponentWithLabel?.label) {
        currentSlide.value.title = firstComponentWithLabel.label;
      }
    }
  },
  { deep: true }
);
</script>
