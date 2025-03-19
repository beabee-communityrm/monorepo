<!-- eslint-disable vue/no-mutating-props -->
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
        <!-- Date Settings Section -->
        <AppScrollSection id="dates" @mounted="registerSection">
          <AppFormBox :title="t('createCallout.tabs.settings.dates.title')">
            <AppFormField>
              <div v-if="canStartNow" class="mb-4">
                <AppToggleField
                  v-model="startDateEnabled"
                  variant="link"
                  :label="inputT('starts.label')"
                  :description="
                    startDateEnabled
                      ? inputT('starts.opts.schedule')
                      : inputT('starts.opts.now')
                  "
                />
              </div>
              <div v-if="startDateEnabled" class="flex gap-2">
                <div>
                  <AppInput v-model="data.startDate" type="date" required />
                </div>
                <div>
                  <AppInput v-model="data.startTime" type="time" required />
                </div>
              </div>
            </AppFormField>
          </AppFormBox>

          <AppFormBox>
            <AppFormField>
              <div class="mb-4">
                <AppToggleField
                  v-model="data.hasEndDate"
                  variant="link"
                  :label="inputT('expires.label')"
                  :description="
                    data.hasEndDate
                      ? inputT('expires.opts.schedule')
                      : inputT('expires.opts.never')
                  "
                />
              </div>
              <div v-if="data.hasEndDate" class="flex gap-2">
                <div>
                  <AppInput v-model="data.endDate" type="date" required />
                </div>
                <div>
                  <AppInput v-model="data.endTime" type="time" required />
                </div>
              </div>
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- General Settings Section -->
        <AppScrollSection id="general" @mounted="registerSection">
          <AppFormBox :title="t('createCallout.tabs.settings.general.title')">
            <template v-if="!env.cnrMode">
              <AppFormField :help="inputT('who.help')">
                <AppRadioGroup
                  v-model="data.whoCanTakePart"
                  name="whoCanTakePart"
                  :label="inputT('who.label')"
                  :options="[
                    ['members', inputT('who.opts.members')],
                    ['everyone', inputT('who.opts.everyone')],
                  ]"
                  required
                />
              </AppFormField>
              <AppFormField
                v-if="data.whoCanTakePart === 'everyone'"
                :help="inputT('anonymous.help')"
              >
                <AppRadioGroup
                  v-model="data.allowAnonymousResponses"
                  name="allowAnonymousResponses"
                  :label="inputT('anonymous.label')"
                  :options="[
                    ['none', inputT('anonymous.opts.none')],
                    ['guests', inputT('anonymous.opts.guests')],
                    ['all', inputT('anonymous.opts.all')],
                  ]"
                  required
                />
              </AppFormField>
              <AppFormField :help="inputT('visible.help')">
                <AppRadioGroup
                  v-model="data.showOnUserDashboards"
                  name="showOnUserDashboards"
                  :label="inputT('visible.label')"
                  :options="[
                    [true, inputT('visible.opts.yes')],
                    [false, inputT('visible.opts.no')],
                  ]"
                  required
                />
              </AppFormField>
              <AppFormField :help="inputT('multiple.help')">
                <AppRadioGroup
                  v-model="data.multipleResponses"
                  name="multipleResponses"
                  :label="inputT('multiple.label')"
                  :options="[
                    [true, inputT('multiple.opts.yes')],
                    [false, inputT('multiple.opts.no')],
                  ]"
                  required
                />
              </AppFormField>
              <AppFormField
                v-if="!data.multipleResponses"
                :help="inputT('editable.help')"
              >
                <AppRadioGroup
                  v-model="data.usersCanEditAnswers"
                  name="usersCanEditAnswers"
                  :label="inputT('editable.label')"
                  :options="[
                    [true, inputT('editable.opts.yes')],
                    [false, inputT('editable.opts.no')],
                  ]"
                  required
                />
              </AppFormField>
            </template>

            <AppFormField
              v-if="env.captchafoxKey"
              :help="inputT('requireCaptcha.help')"
            >
              <AppRadioGroup
                v-model="data.requireCaptcha"
                name="requireCaptcha"
                :label="inputT('requireCaptcha.label')"
                :options="[
                  ['none', inputT('requireCaptcha.opts.none')],
                  ['guest', inputT('requireCaptcha.opts.guests')],
                  ['all', inputT('requireCaptcha.opts.all')],
                ]"
                required
              />
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- Responses Section -->
        <AppScrollSection
          v-if="env.experimentalFeatures"
          id="responses"
          @mounted="registerSection"
        >
          <AppFormBox :title="t('createCallout.tabs.settings.responses.title')">
            <AppFormField :help="inputT('showResponses.help')">
              <AppRadioGroup
                v-model="data.showResponses"
                name="showResponses"
                :label="inputT('showResponses.label')"
                :options="[
                  [true, t('common.yes')],
                  [false, t('common.no')],
                ]"
                required
              />
            </AppFormField>
            <template v-if="data.showResponses">
              <AppFormField>
                <AppCheckboxGroup
                  v-model="data.responseBuckets"
                  :label="inputT('whichResponseBuckets.label')"
                  :options="buckets"
                />
              </AppFormField>
              <AppFormField :help="inputT('whichResponseViews.help')">
                <AppCheckboxGroup
                  v-model="data.responseViews"
                  :label="inputT('whichResponseViews.label')"
                  :options="[
                    {
                      id: 'gallery',
                      label: inputT('whichResponseViews.opts.gallery'),
                    },
                    { id: 'map', label: inputT('whichResponseViews.opts.map') },
                  ]"
                  required
                />
              </AppFormField>
              <AppFormField :help="inputT('responseTitleProp.help')">
                <AppSelect
                  v-model="data.responseTitleProp"
                  :label="inputT('responseTitleProp.label')"
                  :items="formComponentItems"
                  required
                />
              </AppFormField>
              <AppFormField :help="inputT('responseImageProp.help')">
                <AppSelect
                  v-model="data.responseImageProp"
                  :label="inputT('responseImageProp.label')"
                  :items="fileComponentItems"
                  :required="data.responseViews.includes('gallery')"
                />
              </AppFormField>
              <AppFormField>
                <AppLabel :label="inputT('responseLinks.label')" />
                <AppLinkList v-model="data.responseLinks" />
              </AppFormField>
              <AppFormField>
                <AppInput
                  v-model="data.responseImageFilter"
                  :label="inputT('responseImageFilter.label')"
                />
              </AppFormField>
            </template>
          </AppFormBox>
        </AppScrollSection>

        <!-- Map Settings Section -->
        <AppScrollSection
          v-if="
            env.experimentalFeatures &&
            data.showResponses &&
            data.responseViews.includes('map')
          "
          id="map"
          @mounted="registerSection"
        >
          <AppFormBox :title="inputT('mapSchema.title')">
            <AppFormField>
              <AppSelect
                v-model="data.mapSchema.addressProp"
                :label="inputT('mapSchema.addressProp.label')"
                :items="addressComponentItems"
                required
              />
            </AppFormField>
            <AppFormField :help="inputT('mapSchema.style.help')">
              <AppInput
                v-model="data.mapSchema.style"
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
                    v-model="data.mapSchema.initialZoom"
                    type="number"
                    :label="inputT('mapSchema.initialZoom.label')"
                    :min="data.mapSchema.minZoom"
                    :max="data.mapSchema.maxZoom"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="data.mapSchema.minZoom"
                    type="number"
                    :label="inputT('mapSchema.minZoom.label')"
                    :min="0"
                    :max="data.mapSchema.maxZoom"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="data.mapSchema.maxZoom"
                    type="number"
                    :label="inputT('mapSchema.maxZoom.label')"
                    :min="data.mapSchema.minZoom"
                    :max="22"
                    required
                  />
                </div>
              </div>
            </AppFormField>
            <AppFormField>
              <AppSelect
                v-model="data.mapSchema.addressPatternProp"
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
            <AppFormField v-if="!!data.mapSchema.addressPatternProp">
              <AppInput
                v-model="data.mapSchema.addressPattern"
                :label="inputT('mapSchema.addressPattern.label')"
                required
              />
            </AppFormField>
            <AppFormField>
              <AppInput
                v-model="data.mapSchema.geocodeCountries"
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
import useVuelidate from '@vuelidate/core';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  AppRadioGroup,
  AppLabel,
  AppCheckboxGroup,
  AppFormBox,
  AppScrollNavigation,
  AppScrollSection,
  type ScrollSection,
  AppFormField,
  AppToggleField,
} from '@beabee/vue/components';
import { buckets } from '@utils/callouts';
import { sameAs } from '@vuelidate/validators';
import AppInput from '@components/forms/AppInput.vue';
import AppSelect from '@components/forms/AppSelect.vue';
import env from '@env';
import AppLinkList from '@components/forms/AppLinkList.vue';

import type {
  CalloutCaptcha,
  CalloutChannel,
  CalloutMapSchema,
} from '@beabee/beabee-common';
import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';

/**
 * Data for the settings tab, which contains callout configuration options
 */
export interface SettingsTabData {
  whoCanTakePart: 'members' | 'everyone';
  allowAnonymousResponses: 'none' | 'guests' | 'all';
  requireCaptcha: CalloutCaptcha;
  showOnUserDashboards: boolean;
  multipleResponses: boolean;
  usersCanEditAnswers: boolean;
  showResponses: boolean;
  responseViews: ('map' | 'gallery')[];
  responseBuckets: string[];
  responseTitleProp: string;
  responseImageProp: string;
  responseImageFilter: string;
  responseLinks: { text: string; url: string }[];
  mapSchema: CalloutMapSchema;
  locales: string[];
  channels: CalloutChannel[] | null;
  hasEndDate: boolean;
  startNow: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface SettingsTabProps {
  data: SettingsTabData;
  status: ItemStatus | undefined;
  isActive: boolean;
  tabs: CalloutHorizontalTabs;
}

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<SettingsTabProps>();

const { t } = useI18n();
const inputT = (key: string) => t('createCallout.tabs.settings.inputs.' + key);

// Reference to content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for scroll navigation
const sections = ref<ScrollSection[]>([
  {
    id: 'dates',
    label: t('createCallout.tabs.settings.dates.title'),
  },
  {
    id: 'general',
    label: t('createCallout.tabs.settings.general.title'),
  },
]);

// Add responses section if experimental features are enabled
if (env.experimentalFeatures) {
  sections.value.push({
    id: 'responses',
    label: t('createCallout.tabs.settings.responses.title'),
  });

  // Add map section if map view is available
  if (props.data.showResponses && props.data.responseViews.includes('map')) {
    sections.value.push({
      id: 'map',
      label: inputT('mapSchema.title'),
    });
  }
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

// Force step to stay unvalidated until it is visited for new callouts
const hasVisited = ref(!!props.status);
watch(toRef(props, 'isActive'), (active) => (hasVisited.value ||= active));

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

const validation = useVuelidate(
  { hasVisited: { yes: sameAs(true) } },
  { hasVisited }
);

const mapCenter = computed({
  get: () => props.data.mapSchema.center.join(', '),
  set: (newValue) => {
    const [lng, lat] = newValue.split(',').map((v) => Number(v.trim()));
    // eslint-disable-next-line vue/no-mutating-props
    props.data.mapSchema.center = [lng, lat];
  },
});

const mapBounds = computed({
  get: () => props.data.mapSchema.bounds.join(', '),
  set: (newValue) => {
    const [lng1, lat1, lng2, lat2] = newValue
      .split(',')
      .map((v) => Number(v.trim()));
    // eslint-disable-next-line vue/no-mutating-props
    props.data.mapSchema.bounds = [
      [lng1, lat1],
      [lng2, lat2],
    ];
  },
});

// Update navigation sections when responseViews changes
watch(
  () => props.data.responseViews,
  (newViews) => {
    // Check if map section should be added or removed
    const hasMap = newViews.includes('map');
    const hasMapSection = sections.value.some(
      (section) => section.id === 'map'
    );

    if (hasMap && !hasMapSection && props.data.showResponses) {
      sections.value.push({
        id: 'map',
        label: inputT('mapSchema.title'),
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
  () => props.data.showResponses,
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
      props.data.responseViews.includes('map')
    ) {
      sections.value.push({
        id: 'map',
        label: inputT('mapSchema.title'),
      });
    }
  }
);

watch(
  validation,
  () => {
    emit('update:error', validation.value.$errors.length > 0);
    emit('update:validated', !validation.value.$invalid);
  },
  { immediate: true }
);

const canStartNow = computed(
  () =>
    !props.status ||
    props.status === ItemStatus.Draft ||
    props.status === ItemStatus.Scheduled
);

// Computed property to control start date toggle
const startDateEnabled = computed({
  get: () => !props.data.startNow,
  set: (value) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.startNow = !value;
  },
});
</script>
