<template>
  <div>
    <ul>
      <li
        v-for="item in allTabItems"
        :key="item.id"
        class="mb-2 flex items-center rounded p-2"
        :class="
          selectedTab === item.id
            ? 'bg-white font-semibold text-link'
            : 'cursor-pointer text-body-80 hover:text-body'
        "
        @click="selectedTab = item.id"
      >
        <font-awesome-icon :icon="item.icon" class="mr-2" />
        <span class="text-base">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {
  faHourglassStart,
  faHourglassEnd,
} from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import type { SidebarTabs } from './SidebarTabs.interface';

/**
 * Props for the SidebarTabsNavigation component
 */
export interface SidebarTabsNavigationProps {
  /** Configuration for all sidebar tabs */
  sidebarTabs: SidebarTabs;
}

const props = defineProps<SidebarTabsNavigationProps>();

const selectedTab = defineModel<string>('selectedTab', { default: '' });

/**
 * All tab items including the hidden default tab
 */
const allTabItems = computed(() => [
  {
    id: props.sidebarTabs.intro.name,
    label: props.sidebarTabs.intro.name,
    icon: faHourglassStart,
  },
  {
    id: props.sidebarTabs.endMessage.name,
    label: props.sidebarTabs.endMessage.name,
    icon: faHourglassEnd,
  },
]);
</script>
