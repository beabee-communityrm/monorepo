import { onBeforeMount, onBeforeUnmount, type Ref, reactive } from 'vue';
import type { BreadcrumbItem } from '@type';

export const breadcrumbItems = reactive<Ref<BreadcrumbItem[]>[]>([]);

export const addBreadcrumb = (items: Ref<BreadcrumbItem[]>): void => {
  onBeforeMount(() => {
    breadcrumbItems.push(items);
  });
  onBeforeUnmount(() => {
    breadcrumbItems.pop();
  });
};
