<template>
  <AppDropdownButton
    :icon="faTag"
    variant="primaryOutlined"
    :title="t('calloutResponsePage.actions.toggleTag')"
    :show-title="withText"
  >
    <p v-if="tagItems.length === 0" class="px-3 py-2 italic">
      {{ t('calloutResponsesPage.noTags') }}
    </p>
    <AppSelectableList
      v-else
      v-slot="{ item }"
      :items="tagItems"
      :selected-item-ids="selectedTags"
      @click="handleToggle"
    >
      <font-awesome-icon class="mr-2" :icon="faTag" />{{ item.label }}
    </AppSelectableList>

    <router-link
      class="block border-t border-primary-40 px-3 py-2 font-semibold text-primary underline hover:bg-primary-5 group-hover:border-primary"
      :to="manageUrl"
    >
      <font-awesome-icon class="mr-2" :icon="faCog" />{{
        t('calloutResponsePage.manageTags')
      }}
    </router-link>
  </AppDropdownButton>
</template>
<script lang="ts" setup>
import { faCog, faTag } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import AppSelectableList from '../../../AppSelectableList.vue';
import AppDropdownButton from '../../../button/AppDropdownButton.vue';

const emit = defineEmits<{
  (event: 'toggle', id: string, successText: string): void;
}>();
defineProps<{
  tagItems: { id: string; label: string }[];
  selectedTags: string[];
  manageUrl: string;
  withText?: boolean;
}>();

const { t } = useI18n();

function handleToggle(item: unknown, selected: boolean) {
  const tag = item as { id: string; label: string };
  emit(
    'toggle',
    selected ? '-' + tag.id : '+' + tag.id,
    t(
      selected
        ? 'calloutResponsePage.notifications.removedTag'
        : 'calloutResponsePage.notifications.addedTag',
      {
        tag: tag.label,
      }
    )
  );
}
</script>
