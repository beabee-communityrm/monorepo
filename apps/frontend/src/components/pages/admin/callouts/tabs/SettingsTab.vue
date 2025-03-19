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
          <template v-if="!env.cnrMode">
            <AppFormBox :title="t('createCallout.tabs.settings.access.title')">
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
            </AppFormBox>
            <AppFormBox>
              <AppFormField
                v-if="data.whoCanTakePart === 'everyone'"
                :help="inputT('anonymous.help')"
              >
              </AppFormField>
              <AppFormField>
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
            </AppFormBox>
            <AppFormBox>
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
            </AppFormBox>
            <AppFormBox>
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
            </AppFormBox>
          </template>

          <AppFormBox :title="t('createCallout.tabs.settings.captcha.title')">
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
  get: () => !props.data.startNow,
  set: (value) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.data.startNow = !value;
  },
});
</script>
