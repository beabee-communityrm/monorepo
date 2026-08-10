<template>
  <UButton icon="i-lucide-save" @click="handleOpen">
    {{ t('advancedSearch.saveSegment.title') }}
  </UButton>

  <UModal
    v-model:open="showModal"
    :title="t('advancedSearch.saveSegment.title')"
  >
    <template #body>
      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <p class="text-muted">
          {{ t('advancedSearch.saveSegment.text-nuxt') }}
        </p>

        <URadioGroup
          v-if="segment"
          v-model="shouldUpdate"
          :legend="t('advancedSearch.saveSegment.createOrUpdate.label')"
          :items="[
            {
              value: false,
              label: t('advancedSearch.saveSegment.createOrUpdate.create'),
            },
            {
              value: true,
              label: t('advancedSearch.saveSegment.createOrUpdate.update', {
                segment: segment.name,
              }),
            },
          ]"
        />

        <UFormField
          v-if="!shouldUpdate"
          :label="t('advancedSearch.saveSegment.segmentName')"
          required
        >
          <UInput v-model="newSegmentName" class="w-full" autofocus />
        </UFormField>

        <UButton
          type="submit"
          block
          :disabled="!shouldUpdate && !newSegmentName.trim()"
          :loading="isSaving"
        >
          {{
            shouldUpdate
              ? t('advancedSearch.saveSegment.updateSegment')
              : t('advancedSearch.saveSegment.createSegment')
          }}
        </UButton>
      </form>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import type { GetSegmentData, RuleGroup } from '@beabee/beabee-common';
import { addNotification } from '@beabee/vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['saved']);
const props = defineProps<{
  segment: GetSegmentData | undefined;
  rules: RuleGroup;
  saveSegment: (name: string, rules: RuleGroup) => Promise<GetSegmentData>;
  updateSegment: (
    segmentId: string,
    name: string,
    rules: RuleGroup
  ) => Promise<GetSegmentData>;
}>();

const { t } = useI18n();

const showModal = ref(false);
const shouldUpdate = ref(false);
const newSegmentName = ref('');
const isSaving = ref(false);

function handleOpen() {
  showModal.value = true;
  shouldUpdate.value = false;
  newSegmentName.value = '';
  isSaving.value = false;
}

async function handleSubmit() {
  isSaving.value = true;
  try {
    let segment;
    if (shouldUpdate.value) {
      if (!props.segment) return;
      segment = await props.updateSegment(
        props.segment.id,
        props.segment.name,
        props.rules
      );
      addNotification({
        variant: 'success',
        title: t('advancedSearch.updatedSegment', { segment: segment.name }),
      });
    } else {
      segment = await props.saveSegment(newSegmentName.value, props.rules);
      addNotification({
        variant: 'success',
        title: t('advancedSearch.createdSegment', { segment: segment.name }),
      });
    }
    showModal.value = false;
    emit('saved', segment);
  } finally {
    isSaving.value = false;
  }
}
</script>
