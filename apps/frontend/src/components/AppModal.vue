<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-40 flex h-full items-center justify-center bg-black bg-opacity-50 p-4"
      :class="{ hidden: !open }"
    >
      <div
        ref="divRef"
        class="relative flex max-h-full flex-col rounded bg-white p-6 shadow-lg md:max-w-[28rem] md:p-8 lg:w-[28rem]"
        v-bind="$attrs"
        @click.stop
      >
        <button
          class="absolute right-0 top-0 h-8 w-8 hover:text-primary"
          type="button"
          @click="$emit('close')"
        >
          <font-awesome-icon :icon="faTimes" />
        </button>
        <AppHeading v-if="title">
          <span :class="{ 'text-danger': variant === 'danger' }">
            {{ title }}
          </span>
        </AppHeading>
        <div class="overflow-auto">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, ref, toRef, watch } from 'vue';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import AppHeading from './AppHeading.vue';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

defineEmits(['close']);
const props = defineProps<{
  open: boolean;
  title?: string;
  variant?: 'danger';
}>();

const divRef = ref<HTMLElement>();

watch([toRef(props, 'open'), divRef], ([open]) => {
  if (divRef.value) {
    if (open) {
      disableBodyScroll(divRef.value);
    } else {
      enableBodyScroll(divRef.value);
    }
  }
});

onBeforeUnmount(() => {
  if (divRef.value && props.open) {
    enableBodyScroll(divRef.value);
  }
});
</script>
