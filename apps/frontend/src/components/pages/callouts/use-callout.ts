import {
  type GetCalloutData,
  type GetCalloutDataWith,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  ItemStatus,
  getCalloutResponseSettings,
} from '@beabee/beabee-common';
import { isLocale, config as localeConfig } from '@beabee/locale';

import { type Ref, computed, onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentUser, generalContent } from '#store';
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

/**
 * The current user's own responses, and what they can do about responding,
 * for both the callout details page and the respond page.
 */
export function useCalloutResponse(
  callout: Ref<GetCalloutData>,
  { fetchResponses = true }: { fetchResponses?: boolean } = {}
) {
  const { isOpen, isPreview, showLoginPrompt, showMemberOnlyPrompt } =
    useCallout(callout);

  /** The current user's responses, newest first; undefined until loaded */
  const responses =
    ref<GetCalloutResponseDataWith<GetCalloutResponseWith.Answers>[]>();

  const responseSettings = computed(() =>
    getCalloutResponseSettings(callout.value)
  );

  /** Which respond action is open to them, if any */
  const respondAction = computed<'start' | 'add' | 'edit' | null>(() => {
    // Their existing responses decide the action, so there isn't one to offer
    // until those have loaded
    if (!responses.value) return null;

    const hasAccess = !showLoginPrompt.value && !showMemberOnlyPrompt.value;
    const isEligible = isPreview.value || (isOpen.value && hasAccess);

    if (!isEligible) return null;
    if (!responses.value.length) return 'start';

    switch (responseSettings.value) {
      case 'multiple':
        return 'add';
      case 'singleEditable':
        return 'edit';
      case 'singleNonEditable':
      default:
        return null;
    }
  });

  const canRespond = computed(() => respondAction.value !== null);

  onBeforeMount(async () => {
    if (!fetchResponses) return;

    if (isPreview.value || !currentUser.value) {
      responses.value = [];
      return;
    }

    const result = await client.callout.listResponses(
      callout.value.slug,
      {
        rules: {
          condition: 'AND',
          rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
        },
        sort: 'createdAt',
        order: 'DESC',
      },
      [GetCalloutResponseWith.Answers]
    );
    responses.value = result.items;
  });

  return {
    responses,
    canRespond,
    respondAction,
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
