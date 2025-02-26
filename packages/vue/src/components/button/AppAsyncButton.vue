<template>
  <AppButton :loading="loading" @click="handleClick">
    <slot />
  </AppButton>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import AppButton from './AppButton.vue';
import { addNotification } from '../../store/notifications';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  onClick?: (evt: Event) => Promise<void>;
}>();

const { t } = useI18n();

const loading = ref(false);

async function handleClick(evt: Event) {
  loading.value = true;
  try {
    await props.onClick?.(evt);
  } catch {
    addNotification({
      title: t('form.errorMessages.generic'),
      variant: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>
