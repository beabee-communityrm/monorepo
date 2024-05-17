import { computed, reactive, type Ref, type WritableComputedRef } from 'vue';
import {
  type LocationQueryValue,
  type LocationQueryValueRaw,
  useRoute,
  useRouter,
} from 'vue-router';
import { SortType } from '../components/table/table.interface';
import type { RuleGroup } from '@beabee/beabee-common';

export function defineParam<T extends LocationQueryValueRaw>(
  param: string,
  getter: (v: LocationQueryValue) => T,
  queryBehaviour: 'append' | 'replace' = 'append'
): WritableComputedRef<T> {
  const route = useRoute();
  const router = useRouter();
  return computed({
    get: () => getter(route.query[param] as LocationQueryValue),
    set: (value) => {
      router.push({
        query: {
          ...(queryBehaviour === 'append' && route.query),
          [param]: value || undefined,
        },
      });
    },
  });
}

export function definePaginatedQuery(defaultSortBy: string) {
  const route = useRoute();
  const router = useRouter();

  const limit = defineParam('limit', (v) => Number(v) || 25);
  const page = defineParam('page', (v) => Number(v) || 0);

  const sort = computed({
    get: () => ({
      by: (route.query.sortBy as string) || defaultSortBy,
      type: (route.query.sortType as SortType) || SortType.Desc,
    }),
    set: ({ by, type }) => {
      router.replace({
        query: {
          ...route.query,
          sortBy: by || undefined,
          sortType: type,
        },
      });
    },
  });

  return reactive({
    limit,
    page,
    sort,
    query: computed(() => ({
      limit: limit.value,
      offset: limit.value * page.value,
      ...(sort.value.by && {
        sort: sort.value.by,
        order: sort.value.type,
      }),
    })),
  });
}

export function defineRulesParam(defaultRules?: Ref<RuleGroup | undefined>) {
  const route = useRoute();
  const router = useRouter();

  return computed({
    get: () =>
      route.query.r
        ? (JSON.parse(route.query.r as string) as RuleGroup)
        : defaultRules?.value,
    set: (r) =>
      router.push({ query: { ...route.query, r: r && JSON.stringify(r) } }),
  });
}
