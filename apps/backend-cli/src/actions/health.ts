import { ApiHealthStatus } from '@beabee/beabee-common';
import { log as mainLogger } from '@beabee/core/logging';
import { runApp } from '@beabee/core/server';
import { documentService } from '@beabee/core/services/DocumentService';
import { emailService } from '@beabee/core/services/EmailService';
import { imageService } from '@beabee/core/services/ImageService';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { paymentService } from '@beabee/core/services/PaymentService';

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
 * Run the health checks for the given integrations, logging the status of
 * each. Defaults to all integrations. Exits with a non-zero code if any
 * integration is unhealthy.
 * @param integrations The integrations to check
 * @param notify Whether to log failures at error level, which alerts
 */
export const checkHealth = async (
  integrations: HealthIntegration[] = Object.keys(
    checks
  ) as HealthIntegration[],
  notify = false
): Promise<void> => {
  await runApp(async () => {
    let allHealthy = true;

    const failureLevel = notify ? 'error' : 'warning';

    for (const name of integrations) {
      let status: ApiHealthStatus;
      let logged = false;
      try {
        status = await checks[name]();
      } catch (err) {
        status = ApiHealthStatus.UNHEALTHY;
        logged = true;
        log.log(failureLevel, `Health check failed for ${name}`, {
          integration: name,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      if (status === ApiHealthStatus.HEALTHY) {
        log.info(`Integration healthy: ${name}`);
      } else if (status === ApiHealthStatus.DISABLED) {
        log.info(`Integration disabled: ${name}`);
      } else {
        allHealthy = false;
        if (!logged) {
          log.log(failureLevel, `Integration unhealthy: ${name}`);
        }
      }
    }

    if (!allHealthy) {
      process.exit(1);
    }
  });
};
