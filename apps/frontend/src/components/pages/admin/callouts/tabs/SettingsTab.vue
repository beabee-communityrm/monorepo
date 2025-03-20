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
                  <AppInput
                    v-model="localData.startDate"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="localData.startTime"
                    type="time"
                    required
                  />
                </div>
              </div>
            </AppFormField>
          </AppFormBox>

          <AppFormBox>
            <AppFormField>
              <div class="mb-4">
                <AppToggleField
                  v-model="localData.hasEndDate"
                  variant="link"
                  :label="inputT('expires.label')"
                  :description="
                    localData.hasEndDate
                      ? inputT('expires.opts.schedule')
                      : inputT('expires.opts.never')
                  "
                />
              </div>
              <div v-if="localData.hasEndDate" class="flex gap-2">
                <div>
                  <AppInput v-model="localData.endDate" type="date" required />
                </div>
                <div>
                  <AppInput v-model="localData.endTime" type="time" required />
                </div>
              </div>
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- General Settings Section -->
        <AppScrollSection id="general" @mounted="registerSection">
          <template v-if="!env.cnrMode">
            <AppFormBox :title="t('createCallout.tabs.settings.access.title')">
              <AppToggleField
                v-model="openToEveryone"
                variant="link"
                :label="inputT('who.label')"
                :disabled-description="inputT('who.opts.members')"
                :enabled-description="inputT('who.opts.everyone')"
              />

              <div
                v-if="openToEveryone"
                class="border-gray-200 ml-2 mt-4 border-l-2 pl-6"
              >
                <AppFormField>
                  <AppToggleField
                    v-model="collectContactInfo"
                    variant="link"
                    :label="inputT('anonymous.label')"
                    :disabled-description="inputT('anonymous.opts.all')"
                    :enabled-description="inputT('anonymous.opts.none')"
                  />
                </AppFormField>

                <AppFormField v-if="collectContactInfo">
                  <AppToggleField
                    v-model="collectMembersContactInfo"
                    variant="link"
                    :label="inputT('collectMembers.label')"
                    :disabled-description="inputT('collectMembers.opts.no')"
                    :enabled-description="inputT('collectMembers.opts.yes')"
                  />
                </AppFormField>
              </div>
            </AppFormBox>
            <AppFormBox>
              <AppFormField :help="inputT('visible.help')">
                <AppRadioGroup
                  v-model="localData.showOnUserDashboards"
                  name="showOnUserDashboards"
                  :label="inputT('visible.label')"
                  :options="[
                    [true, inputT('visible.opts.yes')],
                    [false, inputT('visible.opts.no')],
                  ]"
                  required
                />
              </AppFormField>
            </AppFormBox>
            <AppFormBox>
              <AppFormField :help="inputT('multiple.help')">
                <AppRadioGroup
                  v-model="localData.multipleResponses"
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
                v-if="!localData.multipleResponses"
                :help="inputT('editable.help')"
              >
                <AppRadioGroup
                  v-model="localData.usersCanEditAnswers"
                  name="usersCanEditAnswers"
                  :label="inputT('editable.label')"
                  :options="[
                    [true, inputT('editable.opts.yes')],
                    [false, inputT('editable.opts.no')],
                  ]"
                  required
                />
              </AppFormField>
            </AppFormBox>
          </template>

          <AppFormBox :title="t('createCallout.tabs.settings.captcha.title')">
            <AppFormField
              v-if="env.captchafoxKey"
              :help="inputT('requireCaptcha.help')"
            >
              <AppRadioGroup
                v-model="localData.requireCaptcha"
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
      </div>

      <!-- Right Sidebar -->
      <div class="flex-0 basis-[15rem] overflow-y-auto">
        <!-- Optional content for right sidebar -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppRadioGroup from '@components/forms/AppRadioGroup.vue';
import { sameAs } from '@vuelidate/validators';
import AppInput from '@components/forms/AppInput.vue';
import env from '@env';
import AppFormBox from '@beabee/vue/components/form/AppFormBox';
import AppToggleField from '@beabee/vue/components/form/AppToggleField';
import AppFormField from '@beabee/vue/components/form/AppFormField';
import {
  AppScrollNavigation,
  AppScrollSection,
  type ScrollSection,
} from '@beabee/vue/components';

import type { CalloutCaptcha, CalloutChannel } from '@beabee/beabee-common';
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
    id: 'access',
    label: t('createCallout.tabs.settings.access.title'),
  },
]);

// Computed sections for navigation
const navigationSections = computed(() => sections.value);

// Create local model from props to avoid direct prop mutation
const localData = ref<SettingsTabData>({ ...props.data });

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
    // Synchronize the data with the parent component
    Object.assign(props.data, newData);
    emit('update:validated', !validation.value.$invalid);
  },
  { deep: true }
);

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

const validation = useVuelidate(
  { hasVisited: { yes: sameAs(true) } },
  { hasVisited }
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
  get: () => !localData.value.startNow,
  set: (value) => {
    localData.value.startNow = !value;
  },
});

// Computed property to control access settings
const openToEveryone = computed({
  get: () => localData.value.whoCanTakePart === 'everyone',
  set: (value) => {
    localData.value.whoCanTakePart = value ? 'everyone' : 'members';
  },
});

// Computed property to control contact information settings
const collectContactInfo = computed({
  get: () => localData.value.allowAnonymousResponses === 'none',
  set: (value) => {
    localData.value.allowAnonymousResponses = value ? 'none' : 'all';
  },
});

// Computed property to control members' contact information settings
const collectMembersContactInfo = computed({
  get: () => localData.value.allowAnonymousResponses === 'none',
  set: (value) => {
    if (value) {
      localData.value.allowAnonymousResponses = 'none';
    } else {
      localData.value.allowAnonymousResponses = 'guests';
    }
  },
});
</script>
