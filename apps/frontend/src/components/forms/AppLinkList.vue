<template>
  <AppRepeatable
    :model-value="modelValue"
    :new-item="() => ({ text: '', url: '' })"
    :add-label="t('adminSettings.general.footer.otherLinks.add')"
  >
    <template #default="{ item }">
      <div class="flex-1">
        <AppInput
          v-model="item.text"
          :label="t('adminSettings.general.footer.otherLinks.linkText')"
          required
        />
      </div>
      <div class="flex-1">
        <AppInput
          v-model="item.url"
          :label="t('adminSettings.general.footer.otherLinks.url')"
          type="text"
          required
        />
      </div>
    </template>
  </AppRepeatable>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import AppInput from './AppInput.vue';
import AppRepeatable from './AppRepeatable.vue';

/**
 * Props for the AppLinkList component
 */
export interface AppLinkListProps {
  /** The model value of the link list */
  modelValue: { text: string; url: string }[];
}

defineProps<AppLinkListProps>();

const { t } = useI18n();
</script>
