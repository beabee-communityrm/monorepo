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
          <AppLabel
            :label="t('callout.builder.tabs.settings.dates.title')"
            class="mb-3 px-4"
          />
          <AppFormBox v-if="canStartNow">
            <AppFormField>
              <AppToggleField
                v-model="localData.hasStartDate"
                variant="link"
                :label="inputT('starts.label')"
                :description="
                  localData.hasStartDate
                    ? inputT('starts.opts.schedule')
                    : inputT('starts.opts.now')
                "
              />
              <div v-if="localData.hasStartDate" class="mt-4 flex gap-2">
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
              <div v-if="localData.hasEndDate" class="mt-4 flex gap-2">
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

        <!-- Access Settings Section -->
        <AppScrollSection
          v-if="!env.cnrMode"
          id="access"
          @mounted="registerSection"
        >
          <AppFormBox :title="t('callout.builder.tabs.settings.access.title')">
            <AppToggleField
              v-model="openToEveryone"
              variant="link"
              :label="inputT('who.label')"
              :disabled-description="inputT('who.opts.members')"
              :enabled-description="inputT('who.opts.everyone')"
            />

            <div
              v-if="openToEveryone"
              class="ml-6 mt-4 border-l-2 border-grey-light pl-6"
            >
              <AppFormField>
                <AppToggleField
                  v-model="collectContactInfo"
                  variant="link"
                  :label="inputT('anonymous.label')"
                  :disabled-description="inputT('anonymous.opts.disabled')"
                  :enabled-description="inputT('anonymous.opts.enabled')"
                />
              </AppFormField>

              <AppFormField v-if="collectContactInfo">
                <AppToggleField
                  v-model="collectMembersContactInfo"
                  variant="link"
                  :label="inputT('collectMembers.label')"
                  :disabled-description="inputT('collectMembers.opts.disabled')"
                  :enabled-description="inputT('collectMembers.opts.enabled')"
                />
              </AppFormField>
            </div>
          </AppFormBox>
          <AppFormBox>
            <AppToggleField
              v-model="localData.showOnUserDashboards"
              variant="link"
              :label="inputT('visible.label')"
              :help="inputT('visible.help')"
              :enabled-description="inputT('visible.opts.enabled')"
              :disabled-description="inputT('visible.opts.disabled')"
            />
          </AppFormBox>

          <AppFormBox>
            <AppToggleField
              v-if="env.captchafoxKey"
              v-model="captchaEnabled"
              variant="link"
              :label="inputT('requireCaptcha.label')"
              :help="inputT('requireCaptcha.help')"
              :description="
                localData.requireCaptcha === CalloutCaptcha.Guest
                  ? inputT('requireCaptcha.opts.guests')
                  : localData.requireCaptcha === CalloutCaptcha.All
                    ? inputT('requireCaptcha.opts.all')
                    : inputT('requireCaptcha.opts.none')
              "
            />

            <div
              v-if="captchaEnabled && env.captchafoxKey"
              class="ml-6 mt-4 border-l-2 border-grey-light pl-6"
            >
              <AppFormField>
                <AppToggleField
                  v-model="captchaForMembers"
                  variant="link"
                  :label="inputT('requireCaptcha.members.label')"
                  :description="
                    captchaForMembers
                      ? inputT('requireCaptcha.members.opts.enabled')
                      : inputT('requireCaptcha.members.opts.disabled')
                  "
                />
              </AppFormField>
            </div>
          </AppFormBox>
        </AppScrollSection>

        <!-- Response Settings Section -->
        <AppScrollSection
          v-if="!env.cnrMode"
          id="responseSettings"
          @mounted="registerSection"
        >
          <AppFormBox :title="inputT('responseSettings.title')">
            <AppFormField>
              <AppRadioGroup
                v-model="responseSettingsOption"
                name="responseSettingsOption"
                :options="[
                  [
                    'singleNonEditable',
                    inputT('responseSettings.opts.singleNonEditable'),
                  ],
                  [
                    'singleEditable',
                    inputT('responseSettings.opts.singleEditable'),
                  ],
                  ['multiple', inputT('responseSettings.opts.multiple')],
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
import {
  ItemStatus,
  type CalloutChannel,
  CalloutCaptcha,
} from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { sameAs } from '@vuelidate/validators';
import AppInput from '@components/forms/AppInput.vue';
import env from '@env';
import {
  AppScrollNavigation,
  AppScrollSection,
  AppRadioGroup,
  AppFormBox,
  AppToggleField,
  AppFormField,
  type ScrollSection,
  AppLabel,
} from '@beabee/vue/components';

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
  hasStartDate: boolean;
  hasEndDate: boolean;
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
const inputT = (key: string) =>
  t('callout.builder.tabs.settings.inputs.' + key);

// Reference to content container
const contentRef = ref<HTMLElement | null>(null);

// Sections for scroll navigation
const sections = ref<ScrollSection[]>([
  {
    id: 'dates',
    label: t('callout.builder.tabs.settings.dates.title'),
  },
  {
    id: 'access',
    label: t('callout.builder.tabs.settings.access.title'),
    get hidden() {
      return !!env.cnrMode;
    },
  },
  {
    id: 'responseSettings',
    label: t('callout.builder.tabs.settings.inputs.responseSettings.title'),
    get hidden() {
      return !!env.cnrMode;
    },
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

// Computed property to control access settings
const openToEveryone = computed({
  get: () => localData.value.whoCanTakePart === 'everyone',
  set: (value) => {
    localData.value.whoCanTakePart = value ? 'everyone' : 'members';
  },
});

// Computed property to control contact information settings
const collectContactInfo = computed({
  get: () => localData.value.allowAnonymousResponses !== 'all',
  set: (value) => {
    // If collectContactInfo is true
    if (value) {
      // Consider the current state of collectMembersContactInfo
      localData.value.allowAnonymousResponses = collectMembersContactInfo.value
        ? 'none'
        : 'guests';
    } else {
      // If no contact information is collected (false)
      localData.value.allowAnonymousResponses = 'all';
    }
  },
});

// Computed property to control members' contact information settings
const collectMembersContactInfo = computed({
  get: () => localData.value.allowAnonymousResponses === 'none',
  set: (value) => {
    // Diese Option ist nur sinnvoll, wenn collectContactInfo aktiviert ist
    if (collectContactInfo.value) {
      localData.value.allowAnonymousResponses = value ? 'none' : 'guests';
    }
  },
});

// Computed property to control captcha settings
const captchaEnabled = computed({
  get: () => localData.value.requireCaptcha !== CalloutCaptcha.None,
  set: (value) => {
    localData.value.requireCaptcha = value
      ? CalloutCaptcha.Guest
      : CalloutCaptcha.None;
  },
});

// Computed property to control captcha for members settings
const captchaForMembers = computed({
  get: () => localData.value.requireCaptcha === CalloutCaptcha.All,
  set: (value) => {
    localData.value.requireCaptcha = value
      ? CalloutCaptcha.All
      : CalloutCaptcha.Guest;
  },
});

// Computed property to handle combined response settings
const responseSettingsOption = computed({
  get: () => {
    if (localData.value.multipleResponses) {
      return 'multiple';
    } else {
      return localData.value.usersCanEditAnswers
        ? 'singleEditable'
        : 'singleNonEditable';
    }
  },
  set: (value: string) => {
    switch (value) {
      case 'multiple':
        localData.value.multipleResponses = true;
        // When multiple responses are allowed, the edit option is irrelevant
        localData.value.usersCanEditAnswers = false;
        break;
      case 'singleEditable':
        localData.value.multipleResponses = false;
        localData.value.usersCanEditAnswers = true;
        break;
      case 'singleNonEditable':
        localData.value.multipleResponses = false;
        localData.value.usersCanEditAnswers = false;
        break;
    }
  },
});
</script>
