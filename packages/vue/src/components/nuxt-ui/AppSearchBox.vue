<!--
  # AppSearchBox
  Search box that applies its value on Enter or when it loses focus, rather
  than on every keystroke, with a button to clear it.

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
    @blur="search = draft"
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
 * Search box applied on Enter or blur.
 *
 * @component AppSearchBox
 */
import { ref, watch } from 'vue';
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

function clear() {
  draft.value = '';
  search.value = '';
}
</script>
