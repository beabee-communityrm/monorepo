<template>
  <AppForm
    :button-text="tag ? t('actions.update') : t('actions.add')"
    :reset-button-text="t('actions.cancel')"
    @submit="handleSubmit"
    @reset="$emit('cancel')"
  >
    <div class="mb-4">
      <AppInput v-model="data.name" :label="t('tagEditor.name')" required />
    </div>
  </AppForm>
</template>
<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import AppForm from '@components/forms/AppForm.vue';
import AppInput from '@components/forms/AppInput.vue';

import type { CreateCalloutTagData, GetCalloutTagData } from '@type';

const { t } = useI18n();

defineEmits<{ (e: 'cancel'): void }>();

const props = defineProps<{
  tag?: GetCalloutTagData;
  onSave?: (data: CreateCalloutTagData) => Promise<void>;
}>();

// This means no form this form is embedded into will ever validate
// while it's open, preventing unsaved changes from propogating
useVuelidate({ never: { required } }, { never: undefined });

const data = reactive({
  name: props.tag?.name || '',
});

async function handleSubmit() {
  await props.onSave?.({
    name: data.name,
    description: '',
  });
}
</script>
