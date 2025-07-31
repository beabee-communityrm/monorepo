<template>
  <div
    class="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded border border-primary-40 py-2 pl-4"
  >
    <span>{{ props.answer.label }}</span>
    <div class="flex items-center gap-2">
      <font-awesome-icon
        :icon="[
          iconStyling.icon.prefix || 'fas',
          iconStyling.icon.name || 'circle',
        ]"
        :style="{
          color: iconStyling.color || 'black',
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
    v-if="isPickerOpen && iconStyling"
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
        v-model="iconStyling.color"
        right-aligned
      />

      <div class="pb-4 pt-4">
        <AppSubHeading class="text-m"> Icon: </AppSubHeading>
        <AppIconPicker
          :id="'mapIcon-' + props.answer.value"
          v-model="iconStyling.icon"
        />
      </div>
    </div>
  </AppModal>
</template>

<script lang="ts" setup>
import type { CalloutMapSchemaIconStylingAnswerIcon } from '@beabee/beabee-common';
import {
  AppButton,
  AppColorInput,
  AppIconPicker,
  AppModal,
  AppSubHeading,
} from '@beabee/vue';

import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const inputT = (key: string) =>
  t('callout.builder.tabs.settings.inputs.' + key);

const iconStyling = defineModel<CalloutMapSchemaIconStylingAnswerIcon>({
  required: true,
});
const props = defineProps<{
  answer: { label: string; value: string };
}>();

const isPickerOpen = ref<boolean>(false);
</script>
