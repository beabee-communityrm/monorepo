<!-- eslint-disable vue/no-mutating-props -->
<template>
  <component
    :is="currentTab.component"
    v-model:data="currentTab.data"
    v-model:validated="currentTab.validated"
    v-model:error="currentTab.error"
    :is-active="true"
    :status="status"
    :locales="locales"
  />
</template>

<script lang="ts" setup>
import type { SidebarTabContentProps } from './SidebarTabs.interface';

defineProps<SidebarTabContentProps>();
</script>
