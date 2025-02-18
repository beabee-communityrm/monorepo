<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex h-full flex-col overflow-y-hidden">
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

    <div class="flex h-full gap-4">
      <!-- Left Sidebar -->
      <div class="flex-0 basis-menu overflow-y-auto">
        <SidebarTabs
          v-model:selected-tab="selectedSidebarTab"
          :sidebar-tabs="sidebarTabs"
        />

        <!-- Slide Navigation -->
        <FormBuilderNavigation
          v-model="currentSlide.navigation"
          :slides="slides"
          :current-slide-no="currentSlideNo"
          :is-first="isFirstSlide"
          :is-last="isLastSlide"
          :locales="props.tabs.settings.data.locales"
        />

        <!-- Slides Management -->
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            {{ t('calloutBuilder.slidesTitle') }}
          </h2>
          <AppButton
            variant="primary"
            size="sm"
            :icon="faPlus"
            @click="handleAddSlide"
          >
            {{ t('calloutBuilder.actions.addSlide') }}
          </AppButton>
        </div>

        <Draggable v-model="slides" item-key="id">
          <template #item="{ element, index }">
            <CalloutSlideItem
              :slide-no="index"
              :slides="slides"
              :active="currentSlideId === element.id"
              @select="currentSlideId = $event"
              @remove="handleRemoveSlide"
            />
          </template>
        </Draggable>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1">
        <component
          :is="currentSidebarTab.component"
          v-model:data="currentSidebarTab.data"
          v-model:validated="currentSidebarTab.validated"
          v-model:error="currentSidebarTab.error"
          :current-slide="currentSlide"
          :slides="slides"
          :show-advanced="showAdvancedOptions"
          :has-locales="hasLocales"
          :component-text="data.componentText"
          :locales="tabs.settings.data.locales"
          :is-active="true"
          :status="status"
          :tabs="tabs"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { ref, watch, reactive, markRaw, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'vuedraggable';

import type { CalloutTabs, ContentTabProps } from '../../callouts.interface';
import type { SidebarTabs as SidebarTabsType } from './sidebar-tabs.interface';

import AppNotification from '@components/AppNotification.vue';
import AppButton from '@components/button/AppButton.vue';
import FormBuilderNavigation from '@components/form-builder/FormBuilderNavigation.vue';
import CalloutSlideItem from '../../CalloutSlideItem.vue';
import SidebarTabs from './SidebarTabs.vue';
import ContentFormTab from './sidebar-tabs/ContentFormTab.vue';
import EndMessageTab from './sidebar-tabs/EndMessageTab.vue';

import { getSlideSchema } from '@utils/callouts';

const props = defineProps<{
  data: ContentTabProps;
  tabs: CalloutTabs;
  status: ItemStatus | undefined;
}>();

const emit = defineEmits(['update:error', 'update:validated']);
const { t } = useI18n();
const route = useRoute();

// State
const showAdvancedOptions = ref(false);
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
const hasLocales = computed(() => props.tabs.settings.data.locales.length > 0);

// Status Indicators
const warnAboutEditing = computed(
  () => props.status === ItemStatus.Open || props.status === ItemStatus.Ended
);

// Sidebar Tabs
const sidebarTabs = reactive<SidebarTabsType>({
  content: {
    name: t('createCallout.tabs.content.title'),
    validated: false,
    error: false,
    component: markRaw(ContentFormTab),
    data: props.data.sidebarTabs.content,
  },
  endMessage: {
    name: t('createCallout.tabs.endMessage.title'),
    validated: false,
    error: false,
    component: markRaw(EndMessageTab),
    data: props.data.sidebarTabs.endMessage,
  },
});

const selectedSidebarTab = ref(sidebarTabs.content.name);

// Computed für aktiven Tab
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
