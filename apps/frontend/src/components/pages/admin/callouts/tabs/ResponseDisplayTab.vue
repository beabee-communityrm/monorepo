<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar with Scroll Navigation -->
      <AppScrollNavigation
        :sections="navigationSections"
        @section-change="onSectionChange"
      />

      <!-- Main Content -->
      <div
        ref="contentRef"
        class="relative max-w-3xl flex-1 overflow-y-auto"
        style="contain: paint"
      >
        <AppFormBox>
          <AppFormField :help="inputT('showResponses.help')">
            <AppToggleField
              v-model="localData.showResponses"
              variant="link"
              :label="inputT('showResponses.label')"
              :enabled-description="inputT('showResponses.opts.yes')"
              :disabled-description="inputT('showResponses.opts.no')"
            />
          </AppFormField>
        </AppFormBox>

        <template v-if="localData.showResponses">
          <!-- Map and Gallery Section -->
          <AppScrollSection id="mapAndGallery" @mounted="registerSection">
            <AppFormBox
              :title="
                t('createCallout.tabs.settings.inputs.mapAndGallery.title')
              "
            >
              <AppFormField>
                <AppToggleField
                  v-model="galleryViewEnabled"
                  variant="link"
                  :label="
                    t(
                      'createCallout.tabs.settings.inputs.mapAndGallery.gallery.label'
                    )
                  "
                  :enabled-description="
                    t(
                      'createCallout.tabs.settings.inputs.mapAndGallery.gallery.enabledDescription'
                    )
                  "
                  :disabled-description="
                    t(
                      'createCallout.tabs.settings.inputs.mapAndGallery.gallery.disabledDescription'
                    )
                  "
                />
              </AppFormField>
            </AppFormBox>
            <AppFormBox>
              <AppFormField>
                <AppToggleField
                  v-model="mapViewEnabled"
                  variant="link"
                  :label="
                    t(
                      'createCallout.tabs.settings.inputs.mapAndGallery.map.label'
                    )
                  "
                  :enabled-description="
                    t(
                      'createCallout.tabs.settings.inputs.mapAndGallery.map.enabledDescription'
                    )
                  "
                  :disabled-description="
                    t(
                      'createCallout.tabs.settings.inputs.mapAndGallery.map.disabledDescription'
                    )
                  "
                />
              </AppFormField>
            </AppFormBox>
          </AppScrollSection>

          <!-- Display Options Section -->
          <AppScrollSection id="displayOptions" @mounted="registerSection">
            <AppFormBox
              :title="t('createCallout.tabs.settings.displayOptions.title')"
              :description="
                t('createCallout.tabs.settings.displayOptions.description')
              "
            >
              <AppFormField>
                <AppCheckboxGroup
                  v-model="localData.responseBuckets"
                  :label="inputT('whichResponseBuckets.label')"
                  :options="buckets"
                />
              </AppFormField>
            </AppFormBox>
          </AppScrollSection>

          <!-- Response Title Section -->
          <AppFormBox>
            <AppFormField :help="inputT('responseTitleProp.help')">
              <AppSelect
                v-model="localData.responseTitleProp"
                :label="inputT('responseTitleProp.label')"
                :items="formComponentItems"
                required
              />
            </AppFormField>
          </AppFormBox>

          <!-- Response Image Section -->
          <AppFormBox>
            <AppFormField :help="inputT('responseImageProp.help')">
              <AppSelect
                v-model="localData.responseImageProp"
                :label="inputT('responseImageProp.label')"
                :items="fileComponentItems"
                :required="localData.responseViews.includes('gallery')"
              />
            </AppFormField>
          </AppFormBox>

          <!-- Response Links Section -->
          <AppFormBox>
            <AppFormField>
              <AppLabel :label="inputT('responseLinks.label')" />
              <AppLinkList v-model="localData.responseLinks" />
            </AppFormField>
            <AppFormField>
              <AppInput
                v-model="localData.responseImageFilter"
                :label="inputT('responseImageFilter.label')"
              />
            </AppFormField>
          </AppFormBox>
        </template>

        <!-- Map Settings Section -->
        <AppScrollSection
          v-if="mapViewEnabled"
          id="map"
          @mounted="registerSection"
        >
          <AppFormBox :title="inputT('mapSchema.title')">
            <AppFormField>
              <AppSelect
                v-model="localData.mapSchema.addressProp"
                :label="inputT('mapSchema.addressProp.label')"
                :items="addressComponentItems"
                required
              />
            </AppFormField>
            <AppFormField :help="inputT('mapSchema.style.help')">
              <AppInput
                v-model="localData.mapSchema.style"
                :label="inputT('mapSchema.style.label')"
                required
              />
            </AppFormField>
            <AppFormField>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <AppInput
                    v-model="mapCenter"
                    :label="inputT('mapSchema.center.label')"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="mapBounds"
                    :label="inputT('mapSchema.bounds.label')"
                    required
                  />
                </div>
              </div>
            </AppFormField>
            <AppFormField>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <AppInput
                    v-model="localData.mapSchema.initialZoom"
                    type="number"
                    :label="inputT('mapSchema.initialZoom.label')"
                    :min="localData.mapSchema.minZoom"
                    :max="localData.mapSchema.maxZoom"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="localData.mapSchema.minZoom"
                    type="number"
                    :label="inputT('mapSchema.minZoom.label')"
                    :min="0"
                    :max="localData.mapSchema.maxZoom"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="localData.mapSchema.maxZoom"
                    type="number"
                    :label="inputT('mapSchema.maxZoom.label')"
                    :min="localData.mapSchema.minZoom"
                    :max="22"
                    required
                  />
                </div>
              </div>
            </AppFormField>
            <AppFormField>
              <AppSelect
                v-model="localData.mapSchema.addressPatternProp"
                :label="inputT('mapSchema.addressPatternProp.label')"
                :items="[
                  {
                    id: '',
                    label: inputT('mapSchema.addressPatternProp.none'),
                  },
                  ...textComponentItems,
                ]"
              />
            </AppFormField>
            <AppFormField v-if="!!localData.mapSchema.addressPatternProp">
              <AppInput
                v-model="localData.mapSchema.addressPattern"
                :label="inputT('mapSchema.addressPattern.label')"
                required
              />
            </AppFormField>
            <AppFormField>
              <AppInput
                v-model="localData.mapSchema.geocodeCountries"
                :label="inputT('mapSchema.geocodeCountries.label')"
              />
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>
      </div>

      <!-- Right Sidebar -->
      <div class="flex-0 basis-[15rem] overflow-y-auto">
        <!-- Optional content for right sidebar -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus, getCalloutComponents } from '@beabee/beabee-common';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import useVuelidate from '@vuelidate/core';
import AppInput from '@components/forms/AppInput.vue';
import {
  AppCheckboxGroup,
  AppLabel,
  AppFormBox,
  AppFormField,
  AppScrollNavigation,
  AppScrollSection,
  AppToggleField,
  type ScrollSection,
} from '@beabee/vue/components';
import AppSelect from '@components/forms/AppSelect.vue';
import AppLinkList from '@components/forms/AppLinkList.vue';
import { buckets } from '@utils/callouts';

import type { CalloutMapSchema } from '@beabee/beabee-common';
import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';

/**
 * Data for the response display tab, which contains response view configuration
 */
export interface ResponseDisplayTabData {
  showResponses: boolean;
  responseViews: ('map' | 'gallery')[];
  responseBuckets: string[];
  responseTitleProp: string;
  responseImageProp: string;
  responseImageFilter: string;
  responseLinks: { text: string; url: string }[];
  mapSchema: CalloutMapSchema;
}

export interface ResponseDisplayTabProps {
  data: ResponseDisplayTabData;
  status: ItemStatus | undefined;
  isActive: boolean;
  tabs: CalloutHorizontalTabs;
}

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<ResponseDisplayTabProps>();

// Create local model from props to avoid direct prop mutation
const localData = ref<ResponseDisplayTabData>({ ...props.data });

// Watch for prop changes and update local data
watch(
  () => props.data,
  (newData) => {
    localData.value = { ...newData };
  },
  { deep: true }
);

// Watch local data changes and emit updates to parent
watch(
  localData,
  (newData) => {
    // Sync data with parent component
    Object.assign(props.data, newData);
    emit('update:validated', true);
  },
  { deep: true }
);

const { t } = useI18n();
const inputT = (key: string) => t('createCallout.tabs.settings.inputs.' + key);

// Reference to content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for scroll navigation
const sections = ref<ScrollSection[]>([
  {
    id: 'mapAndGallery',
    label: t('createCallout.tabs.settings.inputs.mapAndGallery.title'),
  },
  {
    id: 'displayOptions',
    label: t('createCallout.tabs.settings.displayOptions.title'),
    get hidden() {
      return !localData.value.showResponses;
    },
  },
]);

// Add map section if map view is available
if (
  localData.value.showResponses &&
  localData.value.responseViews.includes('map')
) {
  sections.value.push({
    id: 'map',
    label: inputT('mapSchema.title'),
    get hidden() {
      return !localData.value.showResponses;
    },
  });
}

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
}

const formComponentItems = computed(() =>
  getCalloutComponents(props.tabs.content.data)
    .filter((c) => c.input)
    .map((c) => ({
      id: c.fullKey,
      label: c.label || c.fullKey,
      type: c.type,
    }))
);

const fileComponentItems = computed(() =>
  formComponentItems.value.filter((c) => c.type === 'file')
);

const addressComponentItems = computed(() =>
  formComponentItems.value.filter((c) => c.type === 'address')
);

const textComponentItems = computed(() =>
  formComponentItems.value.filter(
    (c) => c.type === 'textfield' || c.type === 'textarea'
  )
);

const mapCenter = computed({
  get: () => localData.value.mapSchema.center.join(', '),
  set: (newValue) => {
    const [lng, lat] = newValue.split(',').map((v) => Number(v.trim()));
    localData.value.mapSchema.center = [lng, lat];
  },
});

const mapBounds = computed({
  get: () => localData.value.mapSchema.bounds.join(', '),
  set: (newValue) => {
    const [lng1, lat1, lng2, lat2] = newValue
      .split(',')
      .map((v) => Number(v.trim()));
    localData.value.mapSchema.bounds = [
      [lng1, lat1],
      [lng2, lat2],
    ];
  },
});

// Update navigation sections when responseViews changes
watch(
  () => localData.value.responseViews,
  (newViews) => {
    // Check if map section should be added or removed
    const hasMap = newViews.includes('map');
    const hasMapSection = sections.value.some(
      (section) => section.id === 'map'
    );

    if (hasMap && !hasMapSection && localData.value.showResponses) {
      sections.value.push({
        id: 'map',
        label: inputT('mapSchema.title'),
        get hidden() {
          return !localData.value.showResponses;
        },
      });
    } else if (!hasMap && hasMapSection) {
      const mapIndex = sections.value.findIndex(
        (section) => section.id === 'map'
      );
      if (mapIndex !== -1) {
        sections.value.splice(mapIndex, 1);
      }
    }
  }
);

// Update navigation sections when showResponses changes
watch(
  () => localData.value.showResponses,
  (showResponses) => {
    const hasMapSection = sections.value.some(
      (section) => section.id === 'map'
    );

    if (!showResponses && hasMapSection) {
      const mapIndex = sections.value.findIndex(
        (section) => section.id === 'map'
      );
      if (mapIndex !== -1) {
        sections.value.splice(mapIndex, 1);
      }
    } else if (
      showResponses &&
      !hasMapSection &&
      localData.value.responseViews.includes('map')
    ) {
      sections.value.push({
        id: 'map',
        label: inputT('mapSchema.title'),
        get hidden() {
          return !localData.value.showResponses;
        },
      });
    }
  }
);

// Basic validation
const validation = useVuelidate();

watch(
  validation,
  () => {
    emit('update:error', validation.value.$errors.length > 0);
  },
  { immediate: true }
);

// Computed properties für die Map- und Gallery-View Toggles
const galleryViewEnabled = computed({
  get: () => localData.value.responseViews.includes('gallery'),
  set: (value) => {
    const views = [...localData.value.responseViews];
    const index = views.indexOf('gallery');

    if (value && index === -1) {
      views.push('gallery');
    } else if (!value && index !== -1) {
      views.splice(index, 1);
    }

    localData.value.responseViews = views;
  },
});

const mapViewEnabled = computed({
  get: () => localData.value.responseViews.includes('map'),
  set: (value) => {
    const views = [...localData.value.responseViews];
    const index = views.indexOf('map');

    if (value && index === -1) {
      views.push('map');
    } else if (!value && index !== -1) {
      views.splice(index, 1);
    }

    localData.value.responseViews = views;
  },
});
</script>
