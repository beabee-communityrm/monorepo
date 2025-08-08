<template>
  <AppDropdownButton
    :icon="faTag"
    variant="primaryOutlined"
    :title="t('tags.toggleTag')"
    :show-title="withText"
  >
    <p v-if="tagItems.length === 0" class="px-3 py-2 italic">
      {{ t('tags.noTags') }}
    </p>
    <AppSelectableList
      v-else
      v-slot="{ item }"
      :items="tagItems"
      :selected-item-ids="selectedTags"
      :disabled="!selectable"
      @click="handleToggle"
    >
      <font-awesome-icon class="mr-2" :icon="faTag" />{{ item.label }}
    </AppSelectableList>

    <router-link
      class="block border-t border-primary-40 px-3 py-2 font-semibold text-primary underline hover:bg-primary-5 group-hover:border-primary"
      :to="manageUrl"
    >
      <font-awesome-icon class="mr-2" :icon="faCog" />{{ t('tags.manageTags') }}
    </router-link>
  </AppDropdownButton>
</template>
<script lang="ts" setup>
import { AppDropdownButton, AppSelectableList } from '@beabee/vue';

import { faCog, faTag } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  (event: 'toggle', id: string, successText: string): void;
}>();
interface Props {
  tagItems: { id: string; label: string }[];
  selectedTags: string[];
  manageUrl: string;
  withText?: boolean;
  selectable?: boolean;
}
withDefaults(defineProps<Props>(), { selectable: true });

const { t } = useI18n();

function handleToggle(item: unknown, selected: boolean) {
  const tag = item as { id: string; label: string };
  emit(
    'toggle',
    selected ? '-' + tag.id : '+' + tag.id,
    t(
      selected
        ? 'tags.notifications.removedTag'
        : 'tags.notifications.addedTag',
      {
        tag: tag.label,
      }
    )
  );
}
</script>
