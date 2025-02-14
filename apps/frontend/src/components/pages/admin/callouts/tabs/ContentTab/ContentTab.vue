<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex h-full flex-col overflow-y-hidden">
    <!-- Notifications TODO: Move this above the form.io main content (requires a refactor) -->
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
        <!-- TODO: Move this to the form.io navigation (requires a refactor) -->
        <FormBuilderNavigation
          v-model="currentSlide.navigation"
          :slides="slides"
          :current-slide-no="currentSlideNo"
          :is-first="isFirstSlide"
          :is-last="isLastSlide"
          :locales="tabs.settings.data.locales"
        />

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

      <!-- Main Content -->
      <!-- TODO: Move this to ContentFormTab -->
      <div v-if="selectedSidebarTab === tabs.content.name">
        <div
          class="callout-slide-builder flex h-full flex-1 flex-col overflow-y-hidden"
        >
          <!-- These styles replicate the FormBuilder layout -->
          <div class="mb-4 flex flex-none items-end gap-4">
            <div class="flex-none basis-60">
              <AppCheckbox
                v-if="env.experimentalFeatures"
                v-model="showAdvancedOptions"
                :label="t('calloutBuilder.showAdvancedOptions')"
              />
            </div>
          </div>

          <FormBuilder
            :key="currentSlideId"
            v-model="currentSlide.components"
            :advanced="showAdvancedOptions"
            :slides="slides"
            class="min-h-0 flex-1"
          />

          <!-- These styles replicate the FormBuilder layout -->
          <div class="flex gap-4">
            <div class="max-w-2xl flex-1">
              <div class="flex justify-between">
                <div>
                  <p v-if="showAdvancedOptions" class="text-sm text-grey">
                    {{ t('common.id') }}: {{ currentSlide.id }}
                  </p>
                </div>
              </div>
              <div
                v-if="tabs.settings.data.locales.length > 0"
                class="my-4 bg-white p-6 shadow-md"
              >
                <AppSubHeading>
                  {{ t('calloutBuilder.translationsTitle') }}
                </AppSubHeading>
                <p class="mb-4">
                  {{ t('calloutBuilder.translationsText') }}
                </p>

                <FormBuilderTranslations
                  v-model="data.componentText"
                  :components="currentSlide.components"
                  :locales="tabs.settings.data.locales"
                />
              </div>
            </div>
            <div class="flex-0 basis-[15rem]" />
          </div>
        </div>
      </div>
      <!-- TODO: Use the sidebar tabs here -->
      <component
        :is="sidebarTabs[currentTabKey].component"
        v-else
        v-model:data="sidebarTabs[currentTabKey].data"
        v-model:validated="sidebarTabs[currentTabKey].validated"
        v-model:error="sidebarTabs[currentTabKey].error"
        :is-active="true"
        :status="status"
        :tabs="tabs"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { ref, watch, reactive, markRaw } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CalloutTabs, ContentTabProps } from '../../callouts.interface';
import {
  AppButton,
  AppNotification,
  AppCheckbox,
} from '@beabee/vue/components';
import FormBuilder from '../../../../../form-builder/FormBuilder.vue';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getSlideSchema } from '../../../../../../utils/callouts';
import FormBuilderNavigation from '../../../../../form-builder/FormBuilderNavigation.vue';
import env from '../../../../../../env';
import Draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import CalloutSlideItem from '../../CalloutSlideItem.vue';
import FormBuilderTranslations from '@components/form-builder/FormBuilderTranslations.vue';
import AppSubHeading from '@components/AppSubHeading.vue';
import SidebarTabs from './SidebarTabs.vue';
import type { SidebarTabs as SidebarTabsType } from './sidebar-tabs.interface';
import ContentFormTab from './sidebar-tabs/ContentFormTab.vue';
import EndMessageTab from './sidebar-tabs/EndMessageTab.vue';

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<{
  data: ContentTabProps;
  tabs: CalloutTabs;
  status: ItemStatus | undefined;
}>();

const { t } = useI18n();

const wasJustReplicated = useRoute().query.replicated !== undefined;

const showAdvancedOptions = ref(false);

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

const warnAboutEditing = computed(
  () => props.status === ItemStatus.Open || props.status === ItemStatus.Ended
);

const validation = useVuelidate();

function handleAddSlide() {
  slides.value.push(getSlideSchema(totalSlides.value + 1));
  currentSlideNo.value = slides.value.length - 1;
}

function handleRemoveSlide(slideNo: number) {
  slides.value.splice(slideNo, 1);
  currentSlideNo.value = Math.max(0, currentSlideNo.value - 1);
}

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

// Add this watch effect to update the internal slide title when components change
watch(
  () => currentSlide.value.components,
  (components) => {
    if (components.length > 0) {
      // Find first component with a defined label
      const firstComponentWithLabel = components.find(
        (component) => component.label && component.label.trim()
      );

      if (firstComponentWithLabel?.label) {
        currentSlide.value.title = firstComponentWithLabel.label;
      }
    }
  },
  { deep: true }
);

// TODO: we need to pass this as a prop from ContentTab.vue
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

const currentTabKey = computed(() => {
  const tab = Object.entries(sidebarTabs).find(
    ([, tab]) => tab.name === selectedSidebarTab.value
  );
  return (tab ? tab[0] : 'content') as keyof SidebarTabsType;
});
</script>
