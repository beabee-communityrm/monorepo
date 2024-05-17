<route lang="yaml">
name: adminSettingsTheme
meta:
  pageTitle: menu.adminSettings
  role: admin
</route>

<template>
  <AppForm
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
        <label
          v-for="preset in colorPresets"
          :key="preset.name"
          class="mb-2 flex max-w-[15rem] cursor-pointer items-center"
        >
          <input
            v-model="activePreset"
            type="radio"
            name="activePreset"
            :value="preset.name"
            required
          />
          <span class="ml-2 flex-1">
            {{ t('adminSettings.theme.presetColors.' + preset.name) }}
          </span>
          <span
            v-for="(color, name) in preset.colors"
            :key="name"
            class="ml-2 h-8 w-8 rounded-full"
            :style="{ backgroundColor: color }"
          >
          </span>
        </label>
        <label class="mb-4 flex h-8 cursor-pointer items-center">
          <input
            id="colorPreset_custom"
            v-model="activePreset"
            type="radio"
            name="activePreset"
            value="custom"
            class="mr-2"
          />
          {{ t('adminSettings.theme.customColors') }}
        </label>
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
  </AppForm>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppHeading from '../../../components/AppHeading.vue';
import { updateContent } from '../../../utils/api/content';
import { getFullTheme, type Theme, validFonts } from '../../../lib/theme';
import { generalContent } from '../../../store';
import AppColorInput from '../../../components/forms/AppColorInput.vue';
import AppSelect from '../../../components/forms/AppSelect.vue';
import AppForm from '../../../components/forms/AppForm.vue';
import App2ColGrid from '../../../components/App2ColGrid.vue';

const { t } = useI18n();

const availableFonts = Object.entries(validFonts).map(([id, [label]]) => ({
  id,
  label,
}));

const colorPresets = [
  {
    name: 'default',
    colors: {
      primary: '#262453',
      link: '#43a796',
      body: '#262453',
    },
  },
];

const visibleCustomColors = [
  'primary',
  'link',
  'body',
  'success',
  'warning',
  'danger',
] as const;

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
    // hasSaved.value = false;
  },
  { deep: true }
);

async function handleSubmit() {
  generalContent.value = await updateContent('general', {
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
