<template>
  <component
    :is="tab.component"
    v-for="tab in tabsInOrder"
    v-show="selectedTab === tab"
    :key="tab.name"
    v-model:data="tab.data"
    v-model:validated="tab.validated"
    v-model:error="tab.error"
    :is-active="selectedTab === tab"
    :status="status"
    :tabs="tabs"
  />
</template>

<script lang="ts" setup>
import { type ItemStatus } from '@beabee/beabee-common';
import type {
  CalloutHorizontalTab,
  CalloutHorizontalTabs,
} from './CalloutHorizontalTabs.interface';

export interface CalloutHorizontalTabsContentProps {
  selectedTab: CalloutHorizontalTab<unknown>;
  tabsInOrder: CalloutHorizontalTab<unknown>[];
  status: ItemStatus | undefined;
  tabs: CalloutHorizontalTabs;
}

defineProps<CalloutHorizontalTabsContentProps>();
</script>
