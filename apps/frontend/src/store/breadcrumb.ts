import {
  type Ref,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { BreadcrumbItem } from '#type';
import { getRouteIcon, getRouteLabel } from '#utils/route-nav';

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
 * The current page's breadcrumb trail: whatever the active page registered
 * via `addBreadcrumb`, or a single crumb derived from the route's sidebar
 * label (falling back to its `pageTitle` meta) if it didn't.
 */
export function useBreadcrumbs() {
  const { t } = useI18n();
  const route = useRoute();

  return computed(() => {
    const items = breadcrumbItems.flatMap((bi) => bi.value);
    if (items.length > 0) {
      return items;
    }
    const pageTitle = route.meta.pageTitle as string | undefined;
    const label = getRouteLabel(route.name) ?? pageTitle;
    return label ? [{ label: t(label), icon: getRouteIcon(route.name) }] : [];
  });
}
