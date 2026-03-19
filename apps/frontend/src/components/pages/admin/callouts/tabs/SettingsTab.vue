<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex min-h-0 gap-4">
      <!-- Left Sidebar with Scroll Navigation -->
      <AppScrollNavigation :sections="sections" />

      <!-- Main Content -->
      <div
        ref="contentRef"
        class="relative max-w-3xl flex-1 overflow-y-auto"
        style="contain: paint"
      >
        <!-- Date Settings Section -->
        <AppScrollSection id="dates">
          <AppLabel
            :label="t('callout.builder.tabs.settings.dates.title')"
            class="mb-3 px-4"
          />
          <AppFormBox v-if="canStartNow">
            <AppFormField>
              <AppToggleField
                v-model="props.data.hasStartDate"
                variant="link"
                :label="inputT('starts.label')"
                :description="
                  props.data.hasStartDate
                    ? inputT('starts.opts.schedule')
                    : inputT('starts.opts.now')
                "
              />
              <div v-if="props.data.hasStartDate" class="mt-4 flex gap-2">
                <div>
                  <AppInput
                    v-model="props.data.startDate"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <AppInput
                    v-model="props.data.startTime"
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
                v-model="props.data.hasEndDate"
                variant="link"
                :label="inputT('expires.label')"
                :description="
                  props.data.hasEndDate
                    ? inputT('expires.opts.schedule')
                    : inputT('expires.opts.never')
                "
              />
              <div v-if="props.data.hasEndDate" class="mt-4 flex gap-2">
                <div>
                  <AppInput v-model="props.data.endDate" type="date" required />
                </div>
                <div>
                  <AppInput v-model="props.data.endTime" type="time" required />
                </div>
              </div>
            </AppFormField>
          </AppFormBox>
        </AppScrollSection>

        <!-- Access Settings Section -->
        <AppScrollSection id="access">
          <AppLabel
            :label="t('callout.builder.tabs.settings.access.title')"
            class="mb-3 px-4"
          />
          <template v-if="!env.cnrMode">
            <AppFormBox>
              <AppToggleField
                v-model="props.data.openToEveryone"
                variant="link"
                :label="inputT('openToEveryone.label')"
                :help="inputT('openToEveryone.help')"
                :disabled-description="inputT('openToEveryone.opts.disabled')"
                :enabled-description="inputT('openToEveryone.opts.enabled')"
              />

              <div
                v-if="props.data.openToEveryone"
                class="ml-6 mt-4 border-l-2 border-grey-light pl-6"
              >
                <AppFormField>
                  <AppToggleField
                    v-model="props.data.collectInfo"
                    variant="link"
                    :label="inputT('collectMemberInfo.label')"
                    :disabled-description="
                      inputT('collectMemberInfo.opts.disabled')
                    "
                    :enabled-description="
                      inputT('collectMemberInfo.opts.enabled')
                    "
                  />
                </AppFormField>

                <AppFormField v-if="props.data.collectInfo">
                  <AppToggleField
                    v-model="props.data.collectGuestInfo"
                    variant="link"
                    :label="inputT('collectGuestInfo.label')"
                    :disabled-description="
                      inputT('collectGuestInfo.opts.disabled')
                    "
                    :enabled-description="
                      inputT('collectGuestInfo.opts.enabled')
                    "
                  />
                </AppFormField>
              </div>
            </AppFormBox>
            <AppFormBox>
              <AppToggleField
                v-model="props.data.showOnUserDashboards"
                variant="link"
                :label="inputT('visible.label')"
                :help="inputT('visible.help')"
                :enabled-description="inputT('visible.opts.enabled')"
                :disabled-description="inputT('visible.opts.disabled')"
              />
            </AppFormBox>
          </template>

          <AppFormBox v-if="env.captchafoxKey">
            <AppToggleField
              v-if="env.captchafoxKey"
              v-model="props.data.captchaEnabled"
              variant="link"
              :label="inputT('requireCaptcha.label')"
              :help="inputT('requireCaptcha.help')"
              :description="
                props.data.captchaEnabled
                  ? props.data.captchaForMembers
                    ? inputT('requireCaptcha.opts.all')
                    : inputT('requireCaptcha.opts.guests')
                  : inputT('requireCaptcha.opts.none')
              "
            />

            <div
              v-if="props.data.captchaEnabled && !env.cnrMode"
              class="ml-6 mt-4 border-l-2 border-grey-light pl-6"
            >
              <AppFormField>
                <AppToggleField
                  v-model="props.data.captchaForMembers"
                  variant="link"
                  :label="inputT('requireCaptcha.members.label')"
                  :enabled-description="
                    inputT('requireCaptcha.members.opts.enabled')
                  "
                  :disabled-description="
                    inputT('requireCaptcha.members.opts.disabled')
                  "
                />
              </AppFormField>
            </div>
          </AppFormBox>
        </AppScrollSection>

        <!-- Response Settings Section -->
        <AppScrollSection v-if="!env.cnrMode" id="responseSettings">
          <AppLabel
            :label="inputT('responseSettings.title')"
            class="mb-3 px-4"
          />
          <AppFormBox
            :notification="
              !canAddNewsletterOptIn
                ? {
                    variant: 'warning',
                    title: inputT('newsletterSettings.disabled'),
                    removeable: false,
                  }
                : undefined
            "
          >
            <AppFormField>
              <AppToggleField
                v-model="data.showNewsletterOptIn"
                variant="link"
                :label="inputT('newsletterSettings.label')"
                :enabled-description="inputT('newsletterSettings.opts.enabled')"
                :disabled-description="
                  inputT('newsletterSettings.opts.disabled')
                "
                :disabled="!canAddNewsletterOptIn"
              />
            </AppFormField>
            <AppFormField
              v-if="canAddNewsletterOptIn && data.showNewsletterOptIn"
            >
              <AppNewsletterOptInSettings
                v-model:title="data.newsletterSettings.title"
                v-model:opt-in="data.newsletterSettings.optIn"
                v-model:text="data.newsletterSettings.text"
                v-model:groups="data.newsletterSettings.groups"
              />
            </AppFormField>
          </AppFormBox>
          <AppFormBox>
            <AppFormField>
              <AppRadioGroup
                v-model="props.data.responseSettings"
                name="responseSettings"
                :label="inputT('responseSettings.label')"
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
  type CalloutChannel,
  type CalloutNewsletterSchema,
  ItemStatus,
} from '@beabee/beabee-common';
import { AppInput } from '@beabee/vue';
import {
  AppFormBox,
  AppFormField,
  AppLabel,
  AppRadioGroup,
  AppScrollNavigation,
  AppScrollSection,
  AppToggleField,
  type ScrollSection,
} from '@beabee/vue';

import useVuelidate from '@vuelidate/core';
import { sameAs } from '@vuelidate/validators';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppNewsletterOptInSettings from '#components/newsletter/AppNewsletterOptInSettings.vue';
import env from '#env';

import type { CalloutHorizontalTabs } from '../CalloutHorizontalTabs.interface';

/**
 * Data for the settings tab, which contains callout configuration options
 */
export interface SettingsTabData {
  openToEveryone: boolean;
  collectInfo: boolean;
  collectGuestInfo: boolean;
  captchaEnabled: boolean;
  captchaForMembers: boolean;
  showNewsletterOptIn: boolean;
  newsletterSettings: CalloutNewsletterSchema;
  showOnUserDashboards: boolean;
  responseSettings: 'singleNonEditable' | 'singleEditable' | 'multiple';
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
const sections = computed<ScrollSection[]>(() => [
  {
    id: 'dates',
    label: t('callout.builder.tabs.settings.dates.title'),
  },
  {
    id: 'access',
    label: t('callout.builder.tabs.settings.access.title'),
  },
  {
    id: 'responseSettings',
    label: t('callout.builder.tabs.settings.inputs.responseSettings.title'),
    hidden: !!env.cnrMode,
  },
]);

const canAddNewsletterOptIn = computed(
  () => !props.data.openToEveryone || props.data.collectInfo
);

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
</script>
