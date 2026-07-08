import { ApiHealthStatus } from '@beabee/beabee-common';
import { log as mainLogger } from '@beabee/core/logging';
import { runApp } from '@beabee/core/server';
import { documentService } from '@beabee/core/services/DocumentService';
import { emailService } from '@beabee/core/services/EmailService';
import { imageService } from '@beabee/core/services/ImageService';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { paymentService } from '@beabee/core/services/PaymentService';

import chalk from 'chalk';

import type { HealthIntegration } from '../types/health.js';

const log = mainLogger.child({ app: 'health-check' });

/** Health check function per integration */
const checks: Record<HealthIntegration, () => Promise<ApiHealthStatus>> = {
  document: () => documentService.getHealthStatus(),
  image: () => imageService.getHealthStatus(),
  newsletter: async () =>
    (await newsletterService.getProviderInfo(true)).status ??
    ApiHealthStatus.DISABLED,
  payment: () => paymentService.getHealthStatus(),
  email: () => emailService.getHealthStatus(),
};

/**
 * Run the health checks for the given integrations, printing the status of
 * each. Defaults to all integrations. Exits with a non-zero code if any
 * integration is unhealthy.
 * @param integrations The integrations to check
 * @param notify Whether to send log notifications
 */
export const checkHealth = async (
  integrations: HealthIntegration[] = Object.keys(
    checks
  ) as HealthIntegration[],
  notify = false
): Promise<void> => {
  await runApp(async () => {
    let allHealthy = true;

    for (const name of integrations) {
      let status: ApiHealthStatus;
      let logged = false;
      try {
        status = await checks[name]();
      } catch (err) {
        status = ApiHealthStatus.UNHEALTHY;
        logged = true;
        if (notify) {
          log.error(`Health check failed for ${name}`, {
            integration: name,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      if (status === ApiHealthStatus.HEALTHY) {
        console.log(`${chalk.green('✓')} ${name.padEnd(10)} healthy`);
        if (notify) log.info(`Integration healthy: ${name}`);
      } else if (status === ApiHealthStatus.DISABLED) {
        if (notify) log.info(`Integration disabled: ${name}`);
        console.log(
          `${chalk.gray('-')} ${name.padEnd(10)} ${chalk.gray('disabled')}`
        );
      } else {
        allHealthy = false;
        console.log(
          `${chalk.red('✗')} ${name.padEnd(10)} ${chalk.red('unhealthy')}`
        );
        if (!logged && notify) {
          log.error(`Integration unhealthy: ${name}`);
        }
      }
    }

    if (!allHealthy) {
      process.exit(1);
    }
  });
};
