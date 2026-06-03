import { faMailchimp } from '@fortawesome/free-brands-svg-icons';
import { ref } from 'vue';

import { client } from '#utils/api/client';
import type { Integration } from '#type/integration';

/**
 * Maps provider identifiers returned by the API to frontend display properties.
 * Add an entry here when a new newsletter provider is supported.
 */
const providerMap: Record<
  string,
  Pick<Integration, 'name' | 'color' | 'textColor' | 'icon'>
> = {
  mailchimp: {
    name: 'Mailchimp',
    color: '#FFE01B',
    icon: faMailchimp,
  },
};

const CATEGORY = 'newsletters';

export function useNewsletterIntegrations() {
  const integrations = ref<Integration[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const data = await client.integrations.listNewsletter();
      integrations.value = data.map((item) => ({
        ...providerMap[item.provider],
        provider: item.provider,
        category: CATEGORY,
        status: item.status,
        audienceId: item.audienceId,
        groups: item.groups,
      }));
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  async function refresh(provider: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await client.integrations.refreshNewsletter(provider);
      const index = integrations.value.findIndex(
        (i) => i.provider === provider
      );
      if (index !== -1) {
        integrations.value[index] = {
          ...providerMap[data.provider],
          provider: data.provider,
          category: CATEGORY,
          status: data.status,
          audienceId: data.audienceId,
          groups: data.groups,
        };
      }
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  return { integrations, loading, error, load, refresh };
}
