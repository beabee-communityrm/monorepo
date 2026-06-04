import { faMailchimp } from '@fortawesome/free-brands-svg-icons';
import { ref } from 'vue';

import env from '#env';
import { client } from '#utils/api/client';
import type { Integration, NewsletterIntegrationGroup } from '#type/integration';

type ProviderDisplayConfig = Pick<Integration, 'name' | 'color' | 'textColor' | 'icon'>;

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

function buildIntegration(
  provider: string,
  status: Integration['status'],
  audienceId?: string,
  groups?: NewsletterIntegrationGroup[]
): Integration {
  return {
    ...providerMap[provider],
    provider,
    category: CATEGORY,
    status,
    audienceId,
    groups,
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
      const configuredProvider = env.newsletterProvider;

      // Build all known provider cards upfront as disabled
      const result = Object.keys(providerMap).map((provider) =>
        buildIntegration(provider, 'disabled')
      );

      // If a provider is configured, fetch its real status and merge it in
      if (configuredProvider && configuredProvider !== 'none') {
        const data = await client.integrations.getNewsletter();
        const index = result.findIndex((i) => i.provider === data.provider);
        if (index !== -1) {
          result[index] = buildIntegration(
            data.provider,
            data.status,
            data.audienceId,
            data.groups
          );
        }
      }

      integrations.value = result;
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  return { integrations, loading, error, load };
}
