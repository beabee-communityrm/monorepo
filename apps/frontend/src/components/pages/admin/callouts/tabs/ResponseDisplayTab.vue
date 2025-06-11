<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar with Scroll Navigation -->
      <AppScrollNavigation :sections="navigationSections" />

      <!-- Main Content -->
      <div
        ref="contentRef"
        class="relative max-w-3xl flex-1 overflow-y-auto"
        style="contain: paint"
      >
        <AppFormBox>
          <AppFormField>
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
          <AppScrollSection id="mapAndGallery">
            <AppFormBox
              :title="
                t('callout.builder.tabs.settings.inputs.mapAndGallery.title')
              "
            >
              <AppFormField>
                <AppToggleField
                  v-model="galleryViewEnabled"
                  variant="link"
                  :label="
                    t(
                      'callout.builder.tabs.settings.inputs.mapAndGallery.gallery.label'
                    )
                  "
                  :enabled-description="
                    t(
                      'callout.builder.tabs.settings.inputs.mapAndGallery.gallery.enabledDescription'
                    )
                  "
                  :disabled-description="
                    t(
                      'callout.builder.tabs.settings.inputs.mapAndGallery.gallery.disabledDescription'
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
                      'callout.builder.tabs.settings.inputs.mapAndGallery.map.label'
                    )
                  "
                  :enabled-description="
                    t(
                      'callout.builder.tabs.settings.inputs.mapAndGallery.map.enabledDescription'
                    )
                  "
                  :disabled-description="
                    t(
                      'callout.builder.tabs.settings.inputs.mapAndGallery.map.disabledDescription'
                    )
                  "
                />
              </AppFormField>
            </AppFormBox>
          </AppScrollSection>

          <!-- Display Options Section -->
          <AppScrollSection id="displayOptions">
            <AppFormBox
              :title="t('callout.builder.tabs.settings.displayOptions.title')"
              :description="
                t('callout.builder.tabs.settings.displayOptions.description')
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
            <AppFormField>
              <AppSelect
                v-model="localData.responseTitleProp"
                :label="inputT('responseTitleProp.label')"
                :description="inputT('responseTitleProp.description')"
                :items="formComponentItems"
                required
              />
            </AppFormField>
          </AppFormBox>

          <!-- Response Image Section -->
          <AppFormBox>
            <AppFormField>
              <AppSelect
                v-model="localData.responseImageProp"
                :label="inputT('responseImageProp.label')"
                :description="inputT('responseImageProp.description')"
                :items="fileComponentItems"
                :required="localData.responseViews.includes('gallery')"
              />
            </AppFormField>
          </AppFormBox>

          <!-- Response Links Section -->
          <AppFormBox>
            <AppFormField>
              <AppToggleField
                v-model="responseLinksEnabled"
                variant="link"
                :label="inputT('responseLinks.label')"
                :enabled-description="inputT('responseLinks.opts.enabled')"
                :disabled-description="inputT('responseLinks.opts.disabled')"
              />
            </AppFormField>
            <template v-if="responseLinksEnabled">
              <AppFormField>
                <p
                  class="mb-2 text-sm"
                  v-html="inputT('responseLinks.description')"
                ></p>
                <AppLinkList
                  v-model="localData.responseLinks"
                  :placeholder-label="inputT('responseLinks.placeholder.label')"
                  :placeholder-url="inputT('responseLinks.placeholder.url')"
                />
              </AppFormField>
            </template>
          </AppFormBox>

          <!-- Map Settings Section -->
          <AppScrollSection v-if="mapViewEnabled" id="map">
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
        </template>
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
import type { CalloutMapSchema } from '@beabee/beabee-common';
import { AppInput } from '@beabee/vue';
import {
  AppCheckboxGroup,
  AppFormBox,
  AppFormField,
  AppScrollNavigation,
  AppScrollSection,
  AppToggleField,
  type ScrollSection,
} from '@beabee/vue/components';

import AppLinkList from '@components/forms/AppLinkList.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import { buckets } from '@utils/callouts';
import useVuelidate from '@vuelidate/core';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

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
  responseLinks: { text: string; url: string }[];
  mapSchema: CalloutMapSchema;
  imageFilter: string;
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
const inputT = (key: string) =>
  t('callout.builder.tabs.settings.inputs.' + key);

// Reference to content container
const contentRef = ref<HTMLElement | null>(null);

// Computed sections for navigation
const navigationSections = computed<ScrollSection[]>(() => [
  {
    id: 'mapAndGallery',
    label: t('callout.builder.tabs.settings.inputs.mapAndGallery.title'),
    get hidden() {
      return !localData.value.showResponses;
    },
  },
  {
    id: 'displayOptions',
    label: t('callout.builder.tabs.settings.displayOptions.title'),
    get hidden() {
      return !localData.value.showResponses;
    },
  },
  {
    id: 'map',
    label: t('callout.builder.tabs.settings.inputs.mapSchema.title'),
    get hidden() {
      return !localData.value.showResponses || !mapViewEnabled.value;
    },
  },
]);

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
    const hasMapSection = navigationSections.value.some(
      (section) => section.id === 'map'
    );

    if (hasMap && !hasMapSection && localData.value.showResponses) {
      navigationSections.value.push({
        id: 'map',
        label: inputT('mapSchema.title'),
        get hidden() {
          return !localData.value.showResponses;
        },
      });
    } else if (!hasMap && hasMapSection) {
      const mapIndex = navigationSections.value.findIndex(
        (section) => section.id === 'map'
      );
      if (mapIndex !== -1) {
        navigationSections.value.splice(mapIndex, 1);
      }
    }
  }
);

// Update navigation sections when showResponses changes
watch(
  () => localData.value.showResponses,
  (showResponses) => {
    const hasMapSection = navigationSections.value.some(
      (section) => section.id === 'map'
    );

    if (!showResponses && hasMapSection) {
      const mapIndex = navigationSections.value.findIndex(
        (section) => section.id === 'map'
      );
      if (mapIndex !== -1) {
        navigationSections.value.splice(mapIndex, 1);
      }
    } else if (
      showResponses &&
      !hasMapSection &&
      localData.value.responseViews.includes('map')
    ) {
      navigationSections.value.push({
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
    emit('update:validated', !validation.value.$invalid);
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

// New responseLinksEnabled computed property
const responseLinksEnabled = computed({
  get: () => localData.value.responseLinks.length > 0,
  set: (value) => {
    // If disabled, clear all response links
    if (!value) {
      localData.value.responseLinks = [];
    }
    // If enabled but no links exist, add an empty one to start
    else if (localData.value.responseLinks.length === 0) {
      localData.value.responseLinks = [{ text: '', url: '' }];
    }
  },
});
</script>
