import { ItemStatus } from '@beabee/beabee-common';
import { type Ref, computed } from 'vue';

import { currentUser, generalContent } from '@store';

import type { GetCalloutDataWith } from '@type';
import { isLocaleKey } from '@lib/i18n';
import i18nConfig from '@lib/i18n-config.json';
import { useRoute, useRouter } from 'vue-router';

export const HASH_PREFIX = '#response-' as const;

export function useCallout(callout: Ref<GetCalloutDataWith<'variantNames'>>) {
  const isOpen = computed(() => callout.value.status === ItemStatus.Open);

  // Callout is only for members and current user isn't logged in
  const showLoginPrompt = computed(
    () =>
      isOpen.value && callout.value.access === 'member' && !currentUser.value
  );

  // Callout is only for members and current user is not a member
  const showMemberOnlyPrompt = computed(
    () =>
      isOpen.value &&
      // !isPreview.value &&
      callout.value.access === 'member' &&
      currentUser.value &&
      !currentUser.value.activeRoles.includes('member')
  );

  const variantItems = computed(() =>
    callout.value.variantNames.map((variantName) => {
      const localeName =
        variantName === 'default' ? generalContent.value.locale : variantName;

      return {
        id: variantName,
        label: isLocaleKey(localeName)
          ? i18nConfig[localeName].displayName
          : localeName,
      };
    })
  );

  const route = useRoute();
  const router = useRouter();

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
    isOpen,
    showLoginPrompt,
    showMemberOnlyPrompt,
    variantItems,
  };
}
