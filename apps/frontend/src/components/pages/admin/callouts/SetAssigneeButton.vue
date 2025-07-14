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
      :disabled="!selectable"
      @click="handleAssign"
    >
      {{ item.label }}
    </AppSelectableList>
    <router-link
      class="block border-t border-primary-40 px-3 py-2 font-semibold text-primary underline hover:bg-primary-5 group-hover:border-primary"
      :to="manageUrl"
    >
      <font-awesome-icon class="mr-2" :icon="faCog" />{{
        t('calloutResponsePage.manageReviewers')
      }}
    </router-link>
  </AppDropdownButton>
</template>

<script lang="ts" setup>
import { AppDropdownButton, AppSelectableList } from '@beabee/vue';
import type { SelectItem } from '@beabee/vue/types';

import { faCog, faUser } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (event: 'assign', id: string | null, successText: string): void;
}>();
defineProps<{
  reviewerItems: SelectItem<string>[];
  manageUrl: string;
  currentAssigneeId?: string;
  withText?: boolean;
  selectable?: boolean;
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
