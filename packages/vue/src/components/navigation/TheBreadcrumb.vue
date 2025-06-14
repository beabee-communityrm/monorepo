<template>
  <ul class="mb-4 flex flex-wrap items-baseline gap-2 text-primary">
    <template v-for="(item, i) in items" :key="i">
      <li class="text-xs first:hidden">
        <font-awesome-icon :icon="faAngleRight" />
      </li>
      <li class="last:font-bold last:text-body">
        <font-awesome-icon v-if="item.icon" :icon="item.icon" class="mr-2" />
        <span class="text-sm">
          <router-link v-if="item.to" :to="item.to">
            {{ item.title }}
          </router-link>
          <span v-else>{{ item.title }}</span>
        </span>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

/**
 * Breadcrumb navigation component
 *
 * @example
 * ```vue
 * <TheBreadcrumb :items="breadcrumbItems" />
 * ```
 */

export interface BreadcrumbItem {
  /** Title text for the breadcrumb item */
  title: string;
  /** Optional router link destination */
  to?: string;
  /** Optional icon to display */
  icon?: IconDefinition;
}

defineProps<{
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
}>();
</script>
