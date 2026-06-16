import { ApiHealthStatus } from '@beabee/beabee-common';
import { documentService } from '@beabee/core/services/DocumentService';
import { imageService } from '@beabee/core/services/ImageService';
import { newsletterService } from '@beabee/core/services/NewsletterService';

import chalk from 'chalk';

import type { HealthIntegration } from '../types/health.js';

/** Health check function per integration */
const checks: Record<HealthIntegration, () => Promise<ApiHealthStatus>> = {
  document: () => documentService.getHealthStatus(),
  image: () => imageService.getHealthStatus(),
  newsletter: async () =>
    (await newsletterService.getProviderInfo(true)).status ??
    ApiHealthStatus.DISABLED,
};

/**
 * Run the health checks for the given integrations, printing the status of
 * each. Defaults to all integrations. Exits with a non-zero code if any
 * integration is unhealthy.
 * @param integrations The integrations to check
 */
export const checkHealth = async (
  integrations: HealthIntegration[] = Object.keys(checks) as HealthIntegration[]
): Promise<void> => {
  let allHealthy = true;

  for (const name of integrations) {
    let status: ApiHealthStatus;
    try {
      status = await checks[name]();
    } catch {
      status = ApiHealthStatus.UNHEALTHY;
    }

    if (status === ApiHealthStatus.HEALTHY) {
      console.log(`${chalk.green('✓')} ${name.padEnd(10)} healthy`);
    } else if (status === ApiHealthStatus.DISABLED) {
      console.log(
        `${chalk.gray('-')} ${name.padEnd(10)} ${chalk.gray('disabled')}`
      );
    } else {
      allHealthy = false;
      console.log(
        `${chalk.red('✗')} ${name.padEnd(10)} ${chalk.red('unhealthy')}`
      );
    }
  }

  if (!allHealthy) {
    process.exit(1);
  }
};
