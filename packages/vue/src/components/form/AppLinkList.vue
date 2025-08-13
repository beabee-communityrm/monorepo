<template>
  <AppRepeatable
    v-model="links"
    :new-item="() => ({ text: '', url: '' })"
    :add-label="resolvedAddLabel"
  >
    <template #default="{ item }">
      <div class="flex-1">
        <AppInput
          v-model="item.text"
          :label="textLabel"
          :placeholder="placeholderLabel"
          required
        />
      </div>
      <div class="flex-1">
        <AppInput
          v-model="item.url"
          :label="urlLabel"
          :placeholder="placeholderUrl"
          type="text"
          required
        />
      </div>
    </template>
  </AppRepeatable>
</template>
<script lang="ts" setup>
/**
 * Link list component for managing multiple text/URL pairs
 *
 * Uses internal i18n for add button: actions.add
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import AppInput from './AppInput.vue';
import AppRepeatable from './AppRepeatable.vue';

const { t } = useI18n();

/**
 * Props for the AppLinkList component
 */
export interface AppLinkListProps {
  /** The placeholder for the link text field */
  placeholderLabel?: string;
  /** The placeholder for the URL field */
  placeholderUrl?: string;
  /** The label for the text field */
  textLabel?: string;
  /** The label for the URL field */
  urlLabel?: string;
  /** Optional override for the add button label */
  addLabel?: string;
}

const props = defineProps<AppLinkListProps>();

// v-model support for the link list
const links = defineModel<{ text: string; url: string }[]>({ default: [] });

// Resolve add label: prefer provided prop, fallback to i18n default
const resolvedAddLabel = computed(() => props.addLabel ?? t('actions.add'));
</script>
