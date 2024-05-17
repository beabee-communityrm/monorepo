<template>
  <AppDropdownButton
    :icon="faFolder"
    variant="primaryOutlined"
    :title="t('calloutResponsePage.actions.moveBucket')"
    :show-title="withText"
  >
    <AppSelectableList
      v-slot="{ item }"
      :items="selectableBuckets"
      @click="handleMove"
    >
      {{
        t('calloutResponsesPage.moveToBucket', {
          bucket: item.label,
        })
      }}
    </AppSelectableList>
  </AppDropdownButton>
</template>

<script lang="ts" setup>
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppSelectableList from '../../../AppSelectableList.vue';
import AppDropdownButton from '../../../button/AppDropdownButton.vue';
import { buckets } from './callouts.interface';

const emit = defineEmits<{
  (event: 'move', id: string, successText: string): void;
}>();
const props = defineProps<{ currentBucket: string; withText?: boolean }>();

const { t } = useI18n();

const selectableBuckets = computed(() =>
  buckets.value.filter((b) => b.id !== props.currentBucket)
);

function handleMove(item: unknown) {
  const bucket = item as { id: string; label: string };

  emit(
    'move',
    bucket.id,
    t('calloutResponsePage.notifications.movedToBucket', {
      bucket: bucket.label,
    })
  );
}
</script>
