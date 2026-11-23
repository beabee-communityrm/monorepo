import {
  CalloutResponseMode,
  type GetCalloutData,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';
import { isLocale, config as localeConfig } from '@beabee/locale';

import { type Ref, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { defineBasicLoader } from 'vue-router/experimental';

import { useDelayedSkeleton } from '#composables/useDelayedSkeleton';
import { holdNavigation } from '#lib/router';
import { currentUser, generalContent } from '#store';
import { client } from '#utils/api';
import { trackLoaderReader } from '#utils/dev/loader-readers';

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

/** The path of the page the responses loader last started loading for */
const responsesLoadingPath = ref<string>();

/** The path of the page the responses loader last failed for */
let responsesFailedPath: string | undefined;

/**
 * Loads the current user's responses for the details, respond and thanks
 * pages, as they decide what those pages offer. Each of those pages exports
 * it. The details and respond pages wait for them. The thanks page waits up
 * to 300 ms, then shows without them and fills in when they arrive. A failed
 * request still shows the page, with the error. The responses come with the
 * path of the page they're for, and a failure notes its page too.
 */
export const useCalloutResponsesData = defineBasicLoader(
  async (
    to
  ): Promise<{
    path: string;
    responses: Paginated<
      GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>
    >;
  }> => {
    responsesLoadingPath.value = to.path;

    const isPreview =
      to.query.preview === null && currentUser.value?.isReviewer;
    if (isPreview || !currentUser.value || !('id' in to.params)) {
      return {
        path: to.path,
        responses: { total: 0, count: 0, offset: 0, items: [] },
      };
    }

    try {
      const responses = await holdNavigation(
        client.callout.listResponses(
          to.params.id,
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
      );
      return { path: to.path, responses };
    } catch (error) {
      responsesFailedPath = to.path;
      throw error;
    }
  },
  {
    errors: () => true,
    lazy: (to) => to.name === 'calloutThanks',
  }
);

/**
 * The current user's own responses, and what they can do about responding,
 * for the callout details, respond and thanks pages.
 */
export function useCalloutResponse(callout: Ref<GetCalloutData>) {
  const route = useRoute();
  const { isOpen, isPreview, showLoginPrompt, showMemberOnlyPrompt } =
    useCallout(callout);

  const { data, error, isLoading, reload } = useCalloutResponsesData();
  trackLoaderReader(data);

  /** A load for this page is under way, rather than for the page being
   * navigated to */
  const loadingHere = computed(
    () => isLoading.value && responsesLoadingPath.value === route.path
  );

  /** The loaded responses are this page's. The loader keeps the previous
   * page's until the new ones arrive. */
  const loadedHere = computed(() => data.value?.path === route.path);

  /** Whether the current user's responses failed to load for this page. It
   * stays up while a new load runs, and an error from another page doesn't
   * show. */
  const responsesError = computed(
    () => !!error.value && responsesFailedPath === route.path
  );

  /** Whether to show a skeleton where the responses go */
  const responsesSkeleton = useDelayedSkeleton(
    computed(
      () => loadingHere.value && !loadedHere.value && !responsesError.value
    )
  );

  /** This page's responses, held back while a skeleton is still showing */
  const responsesPaginated = computed(() =>
    loadedHere.value && !responsesError.value && !responsesSkeleton.value
      ? data.value?.responses
      : undefined
  );

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

  /** Loads the current user's responses again; rejects if they still fail */
  async function loadResponses() {
    await reload();
    if (error.value) throw error.value;
  }

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
