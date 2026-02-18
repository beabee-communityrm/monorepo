import {
  type GetCalloutData,
  type GetCalloutDataWith,
  ItemStatus,
} from '@beabee/beabee-common';
import { isLocale, config as localeConfig } from '@beabee/locale';

import { type Ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { currentUser, generalContent } from '#store';

export const HASH_PREFIX = '#response-' as const;

export function useCallout(callout: Ref<GetCalloutData>) {
  const isOpen = computed(() => callout.value.status === ItemStatus.Open);

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
    showLoginPrompt,
    showMemberOnlyPrompt,
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
