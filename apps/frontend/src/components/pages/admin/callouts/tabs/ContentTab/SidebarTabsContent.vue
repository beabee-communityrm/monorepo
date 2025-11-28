<!-- eslint-disable vue/no-mutating-props -->
<template>
  <component
    :is="currentTab.component"
    v-bind="currentTab"
    :is-active="true"
    :slides="slides"
    :current-slide="currentSlide"
    :status="status"
    :tabs="tabs"
  />
</template>

<script lang="ts" setup>
import type { SidebarTabContentProps } from './SidebarTabs.interface';

defineProps<SidebarTabContentProps>();
</script>
