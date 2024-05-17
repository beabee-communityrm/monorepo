<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <AppNotification
      v-if="warnAboutEditing"
      variant="warning"
      class="mb-4"
      :title="t('editCallout.warning')"
    />

    <AppNotification
      v-if="wasJustReplicated"
      variant="success"
      class="mb-4"
      :title="t('editCallout.replicated')"
    />

    <div class="mt-8 flex gap-8">
      <div class="flex-0 basis-menu">
        <Draggable v-model="slides" item-key="id">
          <template #item="{ element, index }">
            <CalloutSlideItem
              :slide-no="index"
              :slides="slides"
              :active="currentSlideId === element.id"
              @select="currentSlideId = $event"
            />
          </template>
        </Draggable>

        <AppButton
          variant="primary"
          :icon="faPlus"
          class="w-full"
          @click="handleAddSlide"
        >
          {{ t('calloutBuilder.actions.addSlide') }}
        </AppButton>
      </div>

      <div class="callout-slide-builder flex-1">
        <!-- These styles replicate the FormBuilder layout -->
        <div class="mb-4 flex items-end gap-8">
          <div class="flex max-w-2xl flex-1 items-end justify-between gap-4">
            <div class="flex-1">
              <AppInput
                v-model="currentSlide.title"
                :label="t('calloutBuilder.internalTitle')"
                required
              />
            </div>
            <AppButtonGroup>
              <AppButton
                variant="primaryOutlined"
                :icon="faChevronLeft"
                :disabled="isFirstSlide"
                @click="currentSlideNo--"
              />
              <AppButton
                variant="primaryOutlined"
                :icon="faChevronRight"
                :disabled="isLastSlide"
                @click="currentSlideNo++"
              />
            </AppButtonGroup>
          </div>
          <div class="flex-0 basis-[15rem]">
            <AppCheckbox
              v-if="env.experimentalFeatures"
              v-model="showAdvancedOptions"
              :label="t('calloutBuilder.showAdvancedOptions')"
            />
          </div>
        </div>

        <FormBuilder
          :key="currentSlideId /* FormBuilder isn't reactive */"
          v-model="currentSlide.components"
          :advanced="showAdvancedOptions"
          :slides="slides"
        />

        <!-- These styles replicate the FormBuilder layout -->
        <div class="flex gap-8">
          <div class="max-w-2xl flex-1">
            <div class="relative -mt-6 mb-4 bg-white p-6 pt-0 shadow-md">
              <FormBuilderNavigation
                v-model="currentSlide.navigation"
                :slides="slides"
                :current-slide-no="currentSlideNo"
                :is-first="isFirstSlide"
                :is-last="isLastSlide"
                :locales="steps.settings.data.locales"
              />
            </div>
            <div class="text-right">
              <AppButton
                variant="dangerOutlined"
                :icon="faTrash"
                :disabled="totalSlides === 1"
                @click="handleRemoveSlide"
              >
                {{ t('calloutBuilder.actions.removeSlide') }}
              </AppButton>
            </div>
            <div
              v-if="steps.settings.data.locales.length > 0"
              class="my-4 bg-white p-6 shadow-md"
            >
              <AppSubHeading>
                {{ t('calloutBuilder.translationsTitle') }}
              </AppSubHeading>
              <p class="mb-4">
                {{ t('calloutBuilder.translationsText') }}
              </p>

              <FormBuilderTranslations
                v-model="data.componentText"
                :components="currentSlide.components"
                :locales="steps.settings.data.locales"
              />
            </div>
          </div>
          <div class="flex-0 basis-[15rem]" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import useVuelidate from '@vuelidate/core';
import { ref, watch } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CalloutSteps, ContentStepProps } from '../callouts.interface';
import AppNotification from '../../../../AppNotification.vue';
import FormBuilder from '../../../../form-builder/FormBuilder.vue';
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { getSlideSchema } from '../../../../../utils/callouts';
import AppButton from '../../../../button/AppButton.vue';
import AppInput from '../../../../forms/AppInput.vue';
import AppButtonGroup from '../../../../button/AppButtonGroup.vue';
import FormBuilderNavigation from '../../../../form-builder/FormBuilderNavigation.vue';
import AppCheckbox from '../../../../forms/AppCheckbox.vue';
import env from '../../../../../env';
import Draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import CalloutSlideItem from '../CalloutSlideItem.vue';
import FormBuilderTranslations from '@components/form-builder/FormBuilderTranslations.vue';
import AppSubHeading from '@components/AppSubHeading.vue';

const emit = defineEmits(['update:error', 'update:validated']);
const props = defineProps<{
  data: ContentStepProps;
  steps: CalloutSteps;
  status: ItemStatus | undefined;
}>();

const { t } = useI18n();

const wasJustReplicated = useRoute().query.replicated !== undefined;

const showAdvancedOptions = ref(false);

const slides = computed({
  get: () => props.data.slides,
  // eslint-disable-next-line vue/no-mutating-props
  set: (v) => (props.data.slides = v),
});

const currentSlideId = ref(slides.value[0].id);

const currentSlideNo = computed({
  get: () => slides.value.findIndex((s) => s.id === currentSlideId.value),
  set: (v) => (currentSlideId.value = slides.value[v].id),
});
const currentSlide = computed(() => slides.value[currentSlideNo.value]);
const totalSlides = computed(() => slides.value.length);
const isFirstSlide = computed(() => currentSlideNo.value === 0);
const isLastSlide = computed(
  () => currentSlideNo.value === totalSlides.value - 1
);

const warnAboutEditing = computed(
  () => props.status === ItemStatus.Open || props.status === ItemStatus.Ended
);

const validation = useVuelidate();

function handleAddSlide() {
  slides.value.push(getSlideSchema(totalSlides.value + 1));
  currentSlideNo.value = slides.value.length - 1;
}

function handleRemoveSlide() {
  slides.value.splice(currentSlideNo.value, 1);
  currentSlideNo.value = Math.max(0, currentSlideNo.value - 1);
}

watch(
  [validation, slides],
  () => {
    emit('update:error', validation.value.$errors.length > 0);
    emit(
      'update:validated',
      !validation.value.$invalid &&
        slides.value.every(
          (s, i) =>
            s.title &&
            s.components.length > 0 &&
            (i < totalSlides.value - 1
              ? s.navigation.nextText
              : s.navigation.submitText)
        )
    );
  },
  { immediate: true }
);
</script>
<style lang="postcss">
/* Allows the navigation to appear seamlessly part of the form area */
.callout-slide-builder {
  @apply min-h-[35rem];

  .callout-form-builder .formcomponents {
    @apply h-0;
  }
}
</style>
