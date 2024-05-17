<template>
  <div class="mb-2 border-l border-primary-20 pl-2">
    <dd class="mb-1 block text-sm font-semibold text-body-80">{{ name }}</dd>
    <dt class="font-bold">
      <slot>
        {{ valueWithDefault }}
      </slot>
    </dt>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps<{
  name: string;
  value?: unknown;
}>();
const valueWithDefault = computed(() => (props.value ? `${props.value}` : '–'));
</script>
