import {
  CalloutResponseMode,
  type GetCalloutData,
  type GetCalloutDataWith,
  GetCalloutResponseWith,
  ItemStatus,
} from '@beabee/beabee-common';
import { isLocale, config as localeConfig } from '@beabee/locale';

import { queryOptions } from '@tanstack/vue-query';
import { type Ref, computed } from 'vue';
import {
  type RouteLocationNormalizedLoaded,
  useRoute,
  useRouter,
} from 'vue-router';

import { useLazyQuery } from '#composables/useLazyQuery';
import { queryClient } from '#lib/query';
import { routeQuery } from '#lib/route-queries';
import { latestResponsesQuery } from '#queries/callouts';
import { currentUser, generalContent } from '#store';
import type { RouteQueries } from '#type';
import { client } from '#utils/api';

export const HASH_PREFIX = '#response-' as const;

/** The callout's state, and how the current user relates to it */
export function useCallout(callout: Ref<GetCalloutData>) {
  const route = useRoute();

  const isOpen = computed(() => callout.value.status === ItemStatus.Open);

  // Reviewer looking at the callout through the admin preview
  const isPreview = computed(
    () => route.query.preview === null && currentUser.value?.isReviewer
  );

  // Callout is only for members and current user isn't logged in
  const showLoginPrompt = computed(
    () => callout.value.access === 'member' && !currentUser.value
  );

  // Callout is only for members and current user is not a member
  const showMemberOnlyPrompt = computed(
    () =>
      callout.value.access === 'member' &&
      currentUser.value &&
      !currentUser.value.activeRoles.includes('member')
  );

  return {
    isOpen,
    isPreview,
    showLoginPrompt,
    showMemberOnlyPrompt,
  };
}

/** The empty list of responses, for a preview or a signed-out visitor */
const noResponses = { total: 0, count: 0, offset: 0, items: [] };

/**
 * The current user's responses to a CrowdNewsroom, newest first. None for a
 * reviewer's preview or a signed-out visitor.
 *
 * @param route The CrowdNewsroom's page, whose URL gives its id and preview
 */
export function calloutResponsesQuery(route: RouteLocationNormalizedLoaded) {
  const id = 'id' in route.params ? route.params.id : '';
  const isPreview =
    route.query.preview === null && !!currentUser.value?.isReviewer;
  const contact = isPreview ? undefined : currentUser.value?.id;

  return queryOptions({
    queryKey: ['callout', id, 'responses', { contact }],
    queryFn: () =>
      contact
        ? client.callout.listResponses(
            id,
            {
              rules: {
                condition: 'AND',
                rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
              },
              sort: 'createdAt',
              order: 'DESC',
            },
            [GetCalloutResponseWith.Answers]
          )
        : Promise.resolve(noResponses),
  });
}

/**
 * The route queries for the details, respond and thanks pages, which each
 * export them. The details and respond pages wait for the responses, as they
 * decide what those pages offer. The thanks page waits up to 300 ms, then
 * shows without them and fills in when they arrive.
 */
export const calloutResponsesRouteQueries: RouteQueries = (to) => [
  routeQuery(calloutResponsesQuery(to), {
    wait: to.name !== 'calloutThanks',
  }),
];

/**
 * Drops the current user's cached responses to a CrowdNewsroom after they
 * respond, so its pages load them again rather than showing the old ones,
 * and refreshes the responses on the home page
 *
 * @param id The CrowdNewsroom's id, as in its URL
 */
export function forgetCalloutResponses(id: string) {
  queryClient.removeQueries({ queryKey: ['callout', id, 'responses'] });
  queryClient.invalidateQueries({ queryKey: latestResponsesQuery.queryKey });
}

/**
 * The current user's own responses, and what they can do about responding,
 * for the callout details, respond and thanks pages.
 */
export function useCalloutResponse(callout: Ref<GetCalloutData>) {
  const route = useRoute();
  const { isOpen, isPreview, showLoginPrompt, showMemberOnlyPrompt } =
    useCallout(callout);

  const {
    data: responsesPaginated,
    skeleton: responsesSkeleton,
    failed: responsesError,
    retry: loadResponses,
  } = useLazyQuery(() => calloutResponsesQuery(route));

  /** The current user's responses, newest first; undefined until they've
   * loaded, or if they failed */
  const responses = computed(() => responsesPaginated.value?.items);

  /** Which respond action is open to them, if any */
  const respondAction = computed<'start' | 'add' | 'edit' | null>(() => {
    // Their existing responses decide the action, so there isn't one to offer
    // until those have loaded
    if (!responses.value) return null;

    const hasAccess = !showLoginPrompt.value && !showMemberOnlyPrompt.value;
    const isEligible = isPreview.value || (isOpen.value && hasAccess);

    if (!isEligible) return null;
    if (!responses.value.length) return 'start';

    switch (callout.value.responseMode) {
      case CalloutResponseMode.Multiple:
        return 'add';
      case CalloutResponseMode.SingleEditable:
        return 'edit';
      default:
        return null;
    }
  });

  const canRespond = computed(() => respondAction.value !== null);

  /** Where the respond action goes */
  const respondTo = computed(() => ({
    path: '/crowdnewsroom/' + callout.value.slug + '/respond',
    query: route.query,
  }));

  return {
    responses,
    responsesPaginated,
    responsesError,
    responsesSkeleton,
    loadResponses,
    canRespond,
    respondAction,
    respondTo,
  };
}

export function useCalloutVariants(
  callout: Ref<GetCalloutDataWith<'variantNames'>>
) {
  const route = useRoute();
  const router = useRouter();

  const variantItems = computed(() =>
    callout.value.variantNames.map((variantName) => {
      const localeName =
        variantName === 'default' ? generalContent.value.locale : variantName;

      return {
        id: variantName,
        label: isLocale(localeName)
          ? localeConfig[localeName].displayName
          : localeName,
      };
    })
  );

  const currentVariant = computed({
    get: () => route.query.lang?.toString() || 'default',
    set: (value) => {
      router.push({
        query: {
          ...route.query,
          lang: value === 'default' ? undefined : value,
        },
      });
    },
  });

  return {
    currentVariant,
    variantItems,
  };
}
