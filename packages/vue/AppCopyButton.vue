<template>
  <button
    :title="t('actions.copy')"
    class="hover:bg-grey-lighter hover:text-body flex h-full w-10 items-center justify-center"
    @click="handleCopy"
  >
    <font-awesome-icon :icon="faCopy" class="h-4 w-4" />
  </button>
</template>

<script lang="ts" setup>
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';
import { addNotification } from '../../store/notifications';

const props = defineProps<{
  /** The text to copy to clipboard */
  text: string;
}>();

const { t } = useI18n();
const emit = defineEmits(['copy']);

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.text);
    addNotification({
      title: t('notifications.copy.success'),
      variant: 'success',
      removeable: 'auto',
    });
    emit('copy');
  } catch (error) {
    addNotification({
      title: t('notifications.copy.error'),
      description: t('notifications.copy.errorDesc', {
        error,
      }),
      variant: 'error',
      removeable: 'auto',
    });
  }
};
</script>
