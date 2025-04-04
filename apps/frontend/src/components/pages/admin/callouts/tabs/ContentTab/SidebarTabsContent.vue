<!-- eslint-disable vue/no-mutating-props -->
<template>
  <component
    :is="currentTab.component"
    :data="currentTab.data"
    :validated="currentTab.validated"
    :error="currentTab.error"
    :component="currentTab.component"
    :name="currentTab.name"
    :is-active="true"
    :status="status"
    :locales="locales"
  />
</template>

<script lang="ts" setup>
import type { SidebarTabContentProps } from './SidebarTabs.interface';

defineProps<SidebarTabContentProps>();
</script>
