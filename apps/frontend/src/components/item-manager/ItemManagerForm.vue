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
import { AppForm } from '@beabee/vue/components';

import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';

defineEmits<{ (e: 'cancel'): void }>();
defineProps<{
  mode: 'add' | 'update';
  data: D;
  onSave?: (data: D) => Promise<void> | undefined;
}>();

const { t } = useI18n();

// This prevents a parent form from validating while it's open, preventing
// unsaved changes from propogating
useVuelidate({ never: { required } }, { never: undefined });
</script>
