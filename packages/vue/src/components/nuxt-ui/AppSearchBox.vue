<!--
  # AppSearchBox
  Search box that applies its value once typing pauses, or straight away on
  Enter, with a button to clear it.

  ## Internal i18n usage
  - actions.clearSearch: "Clear search"
-->
<template>
  <UInput
    v-model="draft"
    icon="i-lucide-search"
    variant="subtle"
    :placeholder="placeholder"
    @keyup.enter="search = draft"
  >
    <template v-if="draft" #trailing>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="link"
        size="sm"
        :aria-label="t('actions.clearSearch')"
        @click="clear"
      />
    </template>
  </UInput>
</template>

<script lang="ts" setup>
/**
 * Search box applied as you type.
 *
 * @component AppSearchBox
 */
import { onWatcherCleanup, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

export interface AppSearchBoxProps {
  placeholder: string;
}

defineProps<AppSearchBoxProps>();

/** The applied search */
const search = defineModel<string>({ required: true });

const draft = ref(search.value);
watch(search, (value) => (draft.value = value));

watch(draft, (value) => {
  if (value === search.value) return;
  const timer = setTimeout(() => (search.value = value), 300);
  onWatcherCleanup(() => clearTimeout(timer));
});

function clear() {
  draft.value = '';
  search.value = '';
}
</script>
