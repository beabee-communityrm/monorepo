import { CalloutAccess } from '@beabee/beabee-common';

/** Icon and i18n key for a callout's access level, for member-facing UI */
export function getCalloutAccessInfo(access: CalloutAccess): {
  icon: string;
  labelKey: string;
} {
  switch (access) {
    case CalloutAccess.Member:
      return { icon: 'i-lucide-lock', labelKey: 'callouts.access.member' };
    default:
      return {
        icon: 'i-lucide-globe',
        labelKey: 'callouts.access.everyone',
      };
  }
}
