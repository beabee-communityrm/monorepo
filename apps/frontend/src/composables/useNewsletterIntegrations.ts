import type { MailchimpNewsletterIntegrationDataWith } from '@beabee/beabee-common';
import { ApiHealthStatus } from '@beabee/beabee-common';

import { faMailchimp } from '@fortawesome/free-brands-svg-icons';
import { ref } from 'vue';

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
  const integrations = ref<Integration[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const data = await client.integrations.getNewsletter(['health']);

      integrations.value = Object.keys(providerMap).map((provider) => {
        return data.provider !== 'none' && data.provider === provider
          ? buildNewsletterIntegration(data)
          : buildDisabledIntegration(provider);
      });
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  return { integrations, loading, error, load };
}
