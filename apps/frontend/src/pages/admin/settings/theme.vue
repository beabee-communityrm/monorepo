<route lang="yaml">
name: adminSettingsTheme
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <AppApiForm
    :button-text="t('actions.update')"
    :success-text="t('form.saved')"
    :reset-button-text="t('actions.reset')"
    @submit.prevent="handleSubmit"
    @reset="resetTheme"
  >
    <App2ColGrid>
      <template #col1>
        <AppHeading>
          {{ t('adminSettings.theme.fonts') }}
        </AppHeading>
        <div v-if="fonts">
          <div class="mb-4">
            <AppSelect
              v-model="fonts.title"
              :label="t('adminSettings.theme.titleFont')"
              :items="availableFonts"
              required
            />
          </div>
          <div class="mb-4">
            <AppSelect
              v-model="fonts.body"
              :label="t('adminSettings.theme.bodyFont')"
              :items="availableFonts"
              required
            />
          </div>
          <div
            class="content-i18n text-sm font-semibold text-body-80"
            v-html="t('adminSettings.theme.fontNotListed')"
          />
        </div>
      </template>
      <template #col2>
        <AppHeading>
          {{ t('adminSettings.theme.colors') }}
        </AppHeading>
        <div class="mb-2">
          <AppRadioInput
            v-for="preset in colorPresets"
            :key="preset.name"
            v-model="activePreset"
            class="w-full"
            name="activePreset"
            :value="preset.name"
            required
            wrapper-class="mb-2 flex items-center"
            label-class="w-full"
          >
            <div class="flex w-full flex-1 items-center justify-between">
              <span>
                {{ t('adminSettings.theme.presetColors.' + preset.name) }}
              </span>
              <div class="flex">
                <span
                  v-for="(color, name) in preset.colors"
                  :key="name"
                  class="ml-2 h-8 w-8 rounded-full"
                  :style="{ backgroundColor: color }"
                >
                </span>
              </div>
            </div>
          </AppRadioInput>

          <AppRadioInput
            v-model="activePreset"
            name="activePreset"
            value="custom"
            wrapper-class="mb-4 flex h-8 items-center"
          >
            {{ t('adminSettings.theme.customColors') }}
          </AppRadioInput>
        </div>
        <div
          v-if="activePreset === 'custom' && customColors"
          class="grid grid-cols-3 gap-2"
        >
          <div
            v-for="name in visibleCustomColors"
            :key="name"
            class="rounded border border-primary-20 p-2"
          >
            <label class="mb-2 block text-sm">
              {{ t('adminSettings.theme.colorNames.' + name) }}
            </label>
            <AppColorInput :id="name" v-model="customColors[name]" />
          </div>
        </div>
      </template>
    </App2ColGrid>
  </AppApiForm>
</template>

<script lang="ts" setup>
import {
  App2ColGrid,
  AppColorInput,
  AppHeading,
  AppRadioInput,
  AppSelect,
} from '@beabee/vue';
import {
  type Theme,
  availableFonts,
  colorPresets,
  getFullTheme,
  visibleCustomColors,
} from '@beabee/vue/lib/theme';

import AppApiForm from '@components/forms/AppApiForm.vue';
import { client } from '@utils/api';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '../../../store';

const { t } = useI18n();

// Used to restore unsaved themes on exit
let currentTheme = generalContent.value.theme;

const fonts = ref<Theme['fonts']>();
const activePreset = ref('');
const customColors = ref<Theme['colors']>();

const activeTheme = computed(() => {
  const colors =
    activePreset.value === 'custom'
      ? customColors.value
      : colorPresets.find((p) => p.name === activePreset.value)?.colors;

  return { fonts: fonts.value, colors };
});

watch(
  activeTheme,
  (theme) => {
    generalContent.value.theme = theme;
  },
  { deep: true }
);

async function handleSubmit() {
  generalContent.value = await client.content.update('general', {
    theme: activeTheme.value,
  });

  currentTheme = generalContent.value.theme;
}

function resetTheme() {
  const theme = getFullTheme(currentTheme);
  fonts.value = theme.fonts;
  customColors.value = theme.colors;
  activePreset.value =
    colorPresets.find((p) => p.name === currentTheme.colors?._name)?.name ||
    'custom';
}

onBeforeMount(resetTheme);

onBeforeUnmount(() => {
  generalContent.value.theme = currentTheme;
});
</script>
