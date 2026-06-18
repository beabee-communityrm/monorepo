import type {
  GroupChanges,
  MailchimpNewsletterIntegrationDataWith,
} from '@beabee/beabee-common';
import { ApiHealthStatus } from '@beabee/beabee-common';
import { addNotification } from '@beabee/vue/store/notifications';

import { faMailchimp } from '@fortawesome/free-brands-svg-icons';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DisabledIntegration, Integration } from '#type/integration';
import { client } from '#utils/api/client';

type ProviderDisplayConfig = Pick<
  Integration,
  'name' | 'color' | 'textColor' | 'icon'
>;

/**
 * Maps provider identifiers to frontend display properties.
 * Add an entry here when a new newsletter provider is supported.
 * Cards are shown for every entry — those not configured show as disabled.
 */
const providerMap: Record<string, ProviderDisplayConfig> = {
  mailchimp: {
    name: 'Mailchimp',
    color: '#FFE01B',
    icon: faMailchimp,
  },
};

const CATEGORY = 'newsletters';

function buildDisabledIntegration(provider: string): DisabledIntegration {
  return {
    ...providerMap[provider],
    provider,
    category: CATEGORY,
    status: ApiHealthStatus.DISABLED,
  };
}

function buildNewsletterIntegration(
  integrationData: MailchimpNewsletterIntegrationDataWith<'health'>
): Integration {
  return {
    ...providerMap[integrationData.provider],
    provider: integrationData.provider,
    category: CATEGORY,
    status: integrationData.status,
    audienceId: integrationData.audienceId,
    groups: integrationData.groups,
  };
}

export function useNewsletterIntegrations() {
  const { t } = useI18n();
  const integrations = ref<Integration[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      const data = await client.integrations.getNewsletter(['health']);

      integrations.value = Object.keys(providerMap).map((provider) => {
        return data.provider !== 'none' && data.provider === provider
          ? buildNewsletterIntegration(data)
          : buildDisabledIntegration(provider);
      });
    } catch {
      addNotification({
        variant: 'warning',
        title: t('adminSettings.integrations.loadError'),
        removeable: true,
      });
    } finally {
      loading.value = false;
    }
  }

  async function refresh(provider: string) {
    const providerName = providerMap[provider]?.name ?? provider;
    const previousStatus = integrations.value.find(
      (integration) => integration.provider === provider
    )?.status;

    function tNotif(key: string, named?: Record<string, string>) {
      return t(`adminSettings.integrations.refreshResult.${key}`, {
        provider: providerName,
        ...named,
      });
    }

    function notify(variant: 'success' | 'info' | 'warning', title: string) {
      addNotification({ variant, title, removeable: true });
    }

    function buildChangeInfo(groupChanges: GroupChanges[]): string {
      const addedGroups = groupChanges.filter((g) => g.action === 'added');
      const removedGroups = groupChanges.filter((g) => g.action === 'removed');

      const parts: string[] = [];

      if (addedGroups.length > 0)
        parts.push(
          tNotif('added', {
            groups: addedGroups.map((g) => g.label).join(', '),
          })
        );
      if (removedGroups.length > 0)
        parts.push(
          tNotif('removed', {
            groups: removedGroups.map((g) => g.label).join(', '),
          })
        );
      return parts.join('\n');
    }

    try {
      const { info, groupChanges } =
        await client.integrations.refreshNewsletterGroups();

      if (info.provider !== 'none') {
        integrations.value = integrations.value.map((integration) =>
          integration.provider === info.provider
            ? buildNewsletterIntegration(info)
            : integration
        );
      }

      const changeInfo = buildChangeInfo(groupChanges);

      const wasHealthy = previousStatus === ApiHealthStatus.HEALTHY;
      const wasUnhealthy = previousStatus === ApiHealthStatus.UNHEALTHY;
      const nowHealthy = info.status === ApiHealthStatus.HEALTHY;
      const nowUnhealthy = info.status === ApiHealthStatus.UNHEALTHY;

      if (wasHealthy && nowHealthy) {
        notify('success', changeInfo || tNotif('noChanges'));
      } else if (wasHealthy && nowUnhealthy) {
        notify('warning', tNotif('connectionLost'));
      } else if (wasUnhealthy && nowHealthy) {
        notify(
          'success',
          `${tNotif('reconnected')}${changeInfo ? `\n${changeInfo}` : ''}`
        );
      } else if (wasUnhealthy && nowUnhealthy) {
        notify('warning', tNotif('couldNotConnect'));
      }
    } catch {
      notify('warning', tNotif('error'));
    }
  }

  return { integrations, loading, load, refresh };
}
