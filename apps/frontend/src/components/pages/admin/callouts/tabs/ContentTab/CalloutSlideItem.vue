<template>
  <div
    class="mb-4 flex gap-2 rounded p-3"
    :class="active ? 'bg-white' : 'cursor-pointer bg-primary-10'"
    @click="emit('select', slide.id)"
  >
    <div>
      <font-awesome-icon
        :icon="faGripVertical"
        class="cursor-grab text-body-60 hover:text-body"
      />
    </div>
    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <p class="text-light truncate text-sm">
        {{ slideNo + 1 }}: {{ slide.title }}
      </p>
      <p
        v-for="[no, nextSlide] in nextSlides"
        :key="no"
        class="mt-1 truncate text-xs"
      >
        ↳
        <a
          v-if="active"
          class="cursor-pointer hover:underline"
          @click.stop="emit('select', nextSlide.id)"
        >
          {{ no + 1 }}: {{ nextSlide.title }}
        </a>
        <span v-else>{{ no + 1 }}: {{ nextSlide.title }}</span>
      </p>
    </div>
    <div class="flex items-start">
      <AppButton
        variant="dangerGhost"
        :icon="faTrash"
        :disabled="slides.length === 1"
        :title="t('callout.builder.common.actions.remove')"
        class="!p-1"
        @click.stop="handleRemoveSlide"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@beabee/vue';

import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FormBuilderSlide } from '#components/form-builder/form-builder.interface';
import { getDecisionComponent } from '#utils/callouts';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'remove', slideNo: number): void;
}>();

const props = defineProps<{
  slideNo: number;
  slides: FormBuilderSlide[];
  active: boolean;
}>();

const slide = computed(() => props.slides[props.slideNo]);

const nextSlides = computed<[number, FormBuilderSlide][]>(() => {
  const nextSlideId = slide.value.navigation.nextSlideId;
  const decisionSlideIds =
    getDecisionComponent(slide.value.components)?.values.map(
      (v) => v.nextSlideId
    ) || [];

  // Return list of slide titles that can be next, ordered by slide number
  return [nextSlideId, ...decisionSlideIds]
    .filter((v, i, a) => a.indexOf(v) === i) // Filter unique
    .map((id) => props.slides.findIndex((s) => s.id === id))
    .filter((no) => no > -1)
    .sort()
    .map((no) => [no, props.slides[no]]);
});

function handleRemoveSlide() {
  emit('remove', props.slideNo);
}
</script>
