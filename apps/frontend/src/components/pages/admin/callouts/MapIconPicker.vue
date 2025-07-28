<template>
  <div
    class="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded border border-primary-40 py-2 pl-4"
  >
    <span>{{ props.answer.label }}</span>
    <div class="flex items-center gap-2">
      <font-awesome-icon
        :icon="[
          mapIconStyling?.icon.prefix || 'fas',
          mapIconStyling?.icon.name || 'circle',
        ]"
        :style="{
          color: mapIconStyling?.color || 'black',
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
        <strong> {{ props.answer.label }} </strong>.
      </p>
      <AppSubHeading class="text-m"> Color: </AppSubHeading>
      <AppColorInput
        id="mapIconColor"
        v-model="
          mapSchema.mapIconStyling[mapIconProp][props.answer.value].color
        "
        right-aligned
      />

      <div class="pt-4">
        <AppSubHeading class="text-m"> Icon: </AppSubHeading>
        <AppIconPicker
          :id="'mapIcon-' + props.answer.value"
          v-model="
            mapSchema.mapIconStyling[mapIconProp][props.answer.value].icon
          "
          class="mb-4 mt-2"
        />
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts" setup>
import type { CalloutMapSchema } from '@beabee/beabee-common';
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
  answer: { label: string; value: string };
}>();

// Have one bool value per answer to open multiple modals
const isPickerOpen = ref<boolean>(false);

const mapIconProp = computed(() => {
  return mapSchema.value.mapIconProp || '';
});

const mapIconStyling = computed(() => {
  return mapSchema.value.mapIconStyling?.[mapIconProp.value][
    props.answer.value
  ];
});
</script>
