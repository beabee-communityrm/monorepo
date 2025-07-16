<template>
  <AppForm
    :button-text="mode === 'update' ? t('actions.update') : t('actions.add')"
    :reset-button-text="t('actions.cancel')"
    @submit="onSave?.(data)"
    @reset="$emit('cancel')"
  >
    <slot :data="data" :mode="mode" />
  </AppForm>
</template>

<script lang="ts" setup generic="D">
/**
 * A form component for managing items with add/update modes.
 * Provides standardized form handling for item management workflows.
 *
 * @component ItemManagerForm
 *
 * @example
 * <ItemManagerForm
 *   mode="add"
 *   :data="formData"
 *   button-text="Add Item"
 *   reset-button-text="Cancel"
 *   @save="handleSave"
 *   @cancel="handleCancel"
 * >
 *   <template #default="{ data, mode }">
 *     <AppInput v-model="data.name" label="Name" required />
 *   </template>
 * </ItemManagerForm>
 */
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';

import { AppForm } from '../form';

/**
 * Props for the ItemManagerForm component
 */
export interface ItemManagerFormProps<D> {
  /** Form mode - determines button text and behavior */
  mode: 'add' | 'update';
  /** Form data object */
  data: D;
  /** Handler for on save event */
  onSave?: (data: D) => Promise<void> | undefined;
}

defineProps<ItemManagerFormProps<D>>();

/**
 * Events emitted by the ItemManagerForm component
 */
defineEmits<{
  /** Emitted when the form is cancelled */
  (e: 'cancel'): void;
}>();

const { t } = useI18n();

// This prevents a parent form from validating while it's open, preventing
// unsaved changes from propagating
useVuelidate({ never: { required } }, { never: undefined });
</script>
