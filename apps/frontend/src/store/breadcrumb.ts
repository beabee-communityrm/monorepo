import {
  type Ref,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
} from 'vue';

import type { BreadcrumbItem } from '#type';

const breadcrumbItems = reactive<Ref<BreadcrumbItem[]>[]>([]);

export const addBreadcrumb = (items: Ref<BreadcrumbItem[]>): void => {
  onBeforeMount(() => {
    breadcrumbItems.push(items);
  });
  onBeforeUnmount(() => {
    breadcrumbItems.pop();
  });
};

/**
 * The current page's breadcrumb trail, built from whatever the active page
 * (and any ancestor layout components) registered via `addBreadcrumb`.
 */
export const breadcrumbs = computed(() =>
  breadcrumbItems.flatMap((bi) => bi.value)
);
