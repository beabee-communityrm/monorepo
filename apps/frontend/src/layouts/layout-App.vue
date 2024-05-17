<template>
  <component :is="layout" v-if="layout" />
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { shallowRef, watch } from 'vue';

const route = useRoute();

const layout = shallowRef();

watch(
  () => route.meta,
  async (meta) => {
    const layoutName = meta.layout ? meta.layout : 'Dashboard';
    const component = await import(`./layout-${layoutName}.vue`);
    layout.value = component.default;
  }
);
</script>
