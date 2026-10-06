import type { SalesforceContactSyncIntegrationDataWith } from '@beabee/beabee-common';
import { ApiHealthStatus } from '@beabee/beabee-common';
import { addNotification } from '@beabee/vue/store/notifications';

import { faSalesforce } from '@fortawesome/free-brands-svg-icons';
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
 * Add an entry here when a new contact sync provider is supported.
 * Cards are shown for every entry — those not configured show as disabled.
 */
const providerMap: Record<string, ProviderDisplayConfig> = {
  salesforce: {
    name: 'Salesforce',
    color: '#00A1E0',
    textColor: '#fff',
    icon: faSalesforce,
  },
};

const CATEGORY = 'contactSync';

function buildDisabledIntegration(provider: string): DisabledIntegration {
  return {
    ...providerMap[provider],
    provider,
    category: CATEGORY,
    status: ApiHealthStatus.DISABLED,
  };
}

function buildContactSyncIntegration(
  integrationData: SalesforceContactSyncIntegrationDataWith<'health'>
): Integration {
  return {
    ...providerMap[integrationData.provider],
    provider: integrationData.provider,
    category: CATEGORY,
    status: integrationData.status,
  };
}

export function useContactSyncIntegrations() {
  const { t } = useI18n();
  const integrations = ref<Integration[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      const data = await client.integrations.getContactSync(['health']);

      integrations.value = Object.keys(providerMap).map((provider) =>
        data.provider !== 'none' && data.provider === provider
          ? buildContactSyncIntegration(data)
          : buildDisabledIntegration(provider)
      );
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

  /** There is nothing to refresh besides the connection itself */
  async function refresh() {
    await load();
  }

  return { integrations, loading, load, refresh };
}
