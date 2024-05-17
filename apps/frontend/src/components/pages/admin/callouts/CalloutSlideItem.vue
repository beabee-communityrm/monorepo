<template>
  <div
    class="mb-4 flex gap-2 rounded p-4"
    :class="active ? 'bg-white' : 'cursor-pointer bg-primary-10'"
    @click="emit('select', slide.id)"
  >
    <div>
      <font-awesome-icon
        :icon="faGripVertical"
        class="cursor-grab text-body-60 hover:text-body"
      />
    </div>
    <div class="flex-1">
      <p class="font-semibold">{{ slideNo + 1 }}: {{ slide.title }}</p>
      <p v-for="[no, nextSlide] in nextSlides" :key="no" class="mt-1 text-xs">
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
  </div>
</template>

<script lang="ts" setup>
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { getDecisionComponent } from '../../../../utils/callouts';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';

const emit = defineEmits<{ (e: 'select', id: string): void }>();
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
</script>
