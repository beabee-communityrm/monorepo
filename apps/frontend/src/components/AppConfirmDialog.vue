<template>
  <AppModal
    :open="open"
    :title="title"
    :variant="variant"
    @close="$emit('close')"
  >
    <div class="mb-4 text-lg">
      <slot />
    </div>

    <footer class="text-center">
      <AppButton
        v-if="cancel"
        class="mr-4"
        variant="primaryOutlined"
        @click="$emit('close')"
      >
        {{ cancel }}
      </AppButton>
      <AppButton
        :disabled="disableConfirm === true"
        :loading="isConfirming"
        :variant="variant"
        @click="handleConfirm"
      >
        {{ confirm }}
      </AppButton>
    </footer>
  </AppModal>
</template>
<script lang="ts" setup>
import AppButton from './button/AppButton.vue';
import AppModal from './AppModal.vue';
import { ref } from 'vue';

defineEmits(['close']);
const props = defineProps<{
  open: boolean;
  variant?: 'danger';
  confirm: string;
  disableConfirm?: boolean | undefined;
  cancel?: string | undefined;
  title: string;
  onConfirm?: () => Promise<void> | void;
}>();

const isConfirming = ref(false);

async function handleConfirm() {
  isConfirming.value = true;
  await props.onConfirm?.();
  isConfirming.value = false;
}
</script>
