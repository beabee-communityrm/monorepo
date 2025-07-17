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
                  :text-label="inputT('responseLinks.text.label')"
                  :url-label="inputT('responseLinks.url.label')"
                  :add-label="inputT('responseLinks.add')"
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
              <AppFormField>
                <AppSelect
                  v-model="localData.mapSchema.mapIconQuestion"
                  :label="inputT('mapSchema.mapIconQuestions.label')"
                  :items="mapIconQuestions"
                />
              </AppFormField>
              <div v-if="localData.mapSchema.mapIconQuestion">
                <h3 class="mb-2 font-semibold">
                  {{ inputT('mapSchema.mapIconStyling.label') }}
                </h3>
                <div
                  v-for="(value, i) in getValues(mapIconQuestion)"
                  :key="i"
                  class="mb-4"
                >
                  <div
                    class="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded border border-primary-40 py-2 pl-4"
                  >
                    <span>{{ value.label }}</span>
                    <div class="flex items-center gap-2">
                      <font-awesome-icon
                        :icon="[
                          mapIconStyling[mapIconQuestion][i].icon.prefix,
                          mapIconStyling[mapIconQuestion][i].icon.name,
                        ]"
                        :style="{
                          color: mapIconStyling[mapIconQuestion][i].color,
                        }"
                      />
                      <AppButton
                        :icon="solidIcons.faPencil"
                        :variant="'dangerGhost'"
                        size="sm"
                        @click="isPickerOpen[i] = !isPickerOpen[i]"
                      ></AppButton>
                    </div>
                  </div>
                  <AppModal
                    v-if="isPickerOpen[i] && localData.mapSchema.mapIconStyling"
                    :open="isPickerOpen[i]"
                    :title="inputT('mapSchema.mapIconStylingSetting.title')"
                    @close="isPickerOpen[i] = false"
                  >
                    <div class="space-y-4">
                      <p class="mb-6 text-body-80">
                        {{ inputT('mapSchema.mapIconStylingSetting.label') }}
                        <strong>
                          {{
                            mapIconStyling[mapIconQuestion][i].answer
                          }} </strong
                        >.
                      </p>
                      <AppSubHeading class="text-m"> Color: </AppSubHeading>
                      <div style="margin-left: 8px">
                        <AppColorInput
                          id="mapIconColor"
                          v-model="mapIconStyling[mapIconQuestion][i].color"
                        />
                      </div>
                      <div class="pt-4">
                        <AppSubHeading class="text-m"> Icon: </AppSubHeading>
                        <AppIconPicker
                          :id="'mapIcon' + i"
                          v-model="mapIconStyling[mapIconQuestion][i].icon"
                          class="mb-4 mt-2"
                        />
                      </div>
                    </div>
                  </AppModal>
                </div>
              </div>
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
import type { CalloutMapSchema, IconStyles } from '@beabee/beabee-common';
import {
  AppButton,
  AppCheckboxGroup,
  AppColorInput,
  AppFormBox,
  AppFormField,
  AppIconPicker,
  AppInput,
  AppLinkList,
  AppModal,
  AppScrollNavigation,
  AppScrollSection,
  AppSelect,
  AppSubHeading,
  AppToggleField,
  type ScrollSection,
} from '@beabee/vue';

// Download all icons in the package
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
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
      multiple: c.multiple || false,
      values:
        c.type === 'select'
          ? c.data.values
          : (c.values as MapIconQuestionValue[]) || [],
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

const mapIconQuestions = computed(() =>
  formComponentItems.value.filter(
    (c) => (c.type === 'select' && !c.multiple) || c.type === 'radio'
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

// Define MapIconQuestionValue
type MapIconQuestionValue = {
  label: string;
  value: string;
};

// Get options / values for a selected map icon question
function getValues(
  mapIconQuestion: string | undefined
): MapIconQuestionValue[] {
  const question = mapIconQuestions.value.find((q) => q.id === mapIconQuestion);
  return question ? question.values : [];
}

// Have one bool value per answer to open multiple modals
const isPickerOpen = ref<boolean[]>([]);

const mapIconQuestion = computed(() => {
  return localData.value.mapSchema.mapIconQuestion || '';
});

// Computed property to manage mapIconStyling as an object
// where keys are question IDs and values are arrays of IconStyles
const mapIconStyling = computed({
  get() {
    const styling: Record<string, IconStyles[]> = {};
    localData.value.mapSchema.mapIconStyling?.forEach((style) => {
      if (!styling[style.question]) {
        styling[style.question] = [];
      }
      styling[style.question].push(style);
    });
    return styling;
  },
  set(newVal: Record<string, IconStyles[]>) {
    // Flatten the object back into an array and update localData
    localData.value.mapSchema.mapIconStyling = Object.values(newVal).flat();
  },
});

watch(
  () => localData.value.mapSchema.mapIconQuestion,
  (newQuestion) => {
    if (!newQuestion) return;
    const values = getValues(newQuestion);

    // Ensure mapIconStyling exists
    if (!localData.value.mapSchema.mapIconStyling) {
      localData.value.mapSchema.mapIconStyling = [];
    }

    // Initialize mapIconStyling for the new question
    localData.value.mapSchema.mapIconStyling = values.map((value) => {
      const existing = localData.value.mapSchema.mapIconStyling?.find(
        (styling: IconStyles) =>
          styling.answer === value.label && styling.question === newQuestion
      );
      return (
        existing || {
          question: newQuestion,
          answer: value.label,
          color: '#262453',
          icon: {
            prefix: 'fas',
            name: 'circle',
          },
        }
      );
    });
  },
  { immediate: true }
);

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
