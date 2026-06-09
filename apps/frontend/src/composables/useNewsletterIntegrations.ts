import type { MailchimpNewsletterIntegrationDataWith } from '@beabee/beabee-common';
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
    } finally {
      loading.value = false;
    }
  }

  async function refresh(provider: string) {
    const providerName = providerMap[provider]?.name ?? provider;
    const previousStatus = integrations.value.find(
      (i) => i.provider === provider
    )?.status;

    function tr(key: string, named?: Record<string, string>) {
      return t(`adminSettings.integrations.refreshResult.${key}`, {
        provider: providerName,
        ...named,
      });
    }

    function notify(variant: 'success' | 'info' | 'warning', title: string) {
      addNotification({ variant, title, removeable: true });
    }

    function buildChangeParts(
      added: { label: string }[],
      removed: { label: string }[]
    ): string[] {
      const parts: string[] = [];
      if (added.length > 0)
        parts.push(
          tr('added', { groups: added.map((g) => g.label).join(', ') })
        );
      if (removed.length > 0)
        parts.push(
          tr('removed', { groups: removed.map((g) => g.label).join(', ') })
        );
      return parts;
    }

    try {
      const { info, groupChanges } =
        await client.integrations.refreshNewsletterGroups();

      if (info.provider !== 'none') {
        const index = integrations.value.findIndex(
          (i) => i.provider === info.provider
        );
        if (index !== -1) {
          integrations.value[index] = buildIntegration(info);
        }
      }

      if (info.status === ApiHealthStatus.UNHEALTHY) {
        if (previousStatus === ApiHealthStatus.HEALTHY) {
          notify('warning', tr('connectionLost'));
        } else {
          notify('warning', tr('couldNotConnect'));
        }
      } else {
        // info.status === HEALTHY
        const added = groupChanges.filter((g) => g.action === 'added');
        const removed = groupChanges.filter((g) => g.action === 'removed');

        if (previousStatus === ApiHealthStatus.UNHEALTHY) {
          const parts = [
            tr('reconnected'),
            ...buildChangeParts(added, removed),
          ];
          notify('success', parts.join('. '));
        } else {
          if (groupChanges.length > 0) {
            notify('success', buildChangeParts(added, removed).join('. '));
          } else {
            notify('success', tr('noChanges'));
          }
        }
      }
    } catch {
      notify('warning', tr('error'));
    }
  }

  return { integrations, loading, load, refresh };
}
