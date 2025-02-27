<template>
  <AppDropdownButton
    :icon="faUser"
    variant="primaryOutlined"
    :title="t('calloutResponsePage.actions.assignTo')"
    :show-title="withText"
  >
    <AppSelectableList
      v-slot="{ item }"
      :items="reviewerItems"
      :selected-item-ids="currentAssigneeId ? [currentAssigneeId] : []"
      @click="handleAssign"
    >
      {{ item.label }}
    </AppSelectableList>
  </AppDropdownButton>
</template>

<script lang="ts" setup>
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import AppSelectableList from '@components/AppSelectableList.vue';
import { AppDropdownButton } from '@beabee/vue/components';

import type { SelectItem } from '@components/forms/form.interface';

const emit = defineEmits<{
  (event: 'assign', id: string | null, successText: string): void;
}>();
defineProps<{
  reviewerItems: SelectItem<string>[];
  currentAssigneeId?: string;
  withText?: boolean;
}>();

const { t } = useI18n();

function handleAssign(item: SelectItem<string>, selected: boolean) {
  emit(
    'assign',
    selected ? null : item.id,
    t(
      selected
        ? 'calloutResponsePage.notifications.removedAssignee'
        : 'calloutResponsePage.notifications.addedAssignee',
      { assignee: item.label }
    )
  );
}
</script>
