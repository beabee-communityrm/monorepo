<template>
  <div
    class="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded border border-primary-40 py-2 pl-4 mb-2"
  >
    <span>{{ props.value.label }}</span>
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
        :icon="faPencil"
        :variant="'dangerGhost'"
        size="sm"
        @click="isPickerOpen = !isPickerOpen"
      ></AppButton>
    </div>
  </div>
  <AppModal
    v-if="isPickerOpen && mapSchema.mapIconStyling"
    :open="isPickerOpen"
    :title="inputT('mapSchema.mapIconStylingSetting.title')"
    @close="isPickerOpen = false"
  >
    <div class="space-y-4">
      <p class="mb-6 text-body-80">
        {{ inputT('mapSchema.mapIconStylingSetting.label') }}
        <strong> {{ mapIconStyling[mapIconQuestion][i].answer }} </strong>.
      </p>
      <AppSubHeading class="text-m"> Color: </AppSubHeading>
      <AppColorInput
        id="mapIconColor"
        v-model="mapIconStyling[mapIconQuestion][i].color"
        right-aligned
      />

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
</template>

<script lang="ts" setup>
import type {
  CalloutMapIconStyle,
  CalloutMapSchema,
} from '@beabee/beabee-common';
import {
  AppButton,
  AppColorInput,
  AppIconPicker,
  AppModal,
  AppSubHeading,
} from '@beabee/vue';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const inputT = (key: string) =>
  t('callout.builder.tabs.settings.inputs.' + key);

const mapSchema = defineModel<CalloutMapSchema>({ required: true });
const props = defineProps<{
  value: { label: string; value: string };
  i: number;
}>();

// Have one bool value per answer to open multiple modals
const isPickerOpen = ref<boolean>(false);

const mapIconQuestion = computed(() => {
  return mapSchema.value.mapIconProp || '';
});

// Computed property to manage mapIconStyling as an object
// where keys are question IDs and values are arrays of IconStyles
const mapIconStyling = computed({
  get() {
    const styling: Record<string, CalloutMapIconStyle[]> = {};
    mapSchema.value.mapIconStyling?.forEach((style) => {
      if (!styling[style.question]) {
        styling[style.question] = [];
      }
      styling[style.question].push(style);
    });
    return styling;
  },
  set(newVal: Record<string, CalloutMapIconStyle[]>) {
    // Flatten the object back into an array and update localData
    mapSchema.value.mapIconStyling = Object.values(newVal).flat();
  },
});
</script>
