<template>
  <div
    class="mb-2 flex items-center gap-2 rounded p-2"
    :class="
      active
        ? 'bg-white font-semibold text-link'
        : 'cursor-pointer text-body-80 hover:text-body'
    "
    @click="emit('select', slide.id)"
  >
    <font-awesome-icon
      :icon="faGripVertical"
      class="cursor-grab hover:text-body"
    />
    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <p class="truncate">{{ slideNo + 1 }}: {{ slide.title }}</p>
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
    <AppButton
      variant="dangerGhost"
      :icon="faTrash"
      :disabled="slides.length === 1"
      :title="t('callout.builder.common.actions.remove')"
      class="!p-1"
      @click.stop="handleRemoveSlide"
    />
  </div>
</template>

<script lang="ts" setup>
import { faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { getDecisionComponent } from '@utils/callouts';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import { AppButton } from '@beabee/vue/components';
import { useI18n } from 'vue-i18n';

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
