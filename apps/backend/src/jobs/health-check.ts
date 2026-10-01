import {
  ApiHealthStatus,
  HEALTH_INTEGRATIONS,
  HealthIntegration,
  JobName,
} from '@beabee/beabee-common';
import { documentService } from '@beabee/core/services/DocumentService';
import { emailService } from '@beabee/core/services/EmailService';
import { imageService } from '@beabee/core/services/ImageService';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { paymentService } from '@beabee/core/services/PaymentService';

import { HealthCheckJobArgsDto } from '#api/dto/JobDto';
import type { Job } from '#type/job';

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
 * Checks the given integrations and fails if any is unhealthy. With `notify`
 * the failures are logged at error level so they reach the alerting.
 */
export const healthCheckJob: Job<JobName.HealthCheck> = {
  argsDto: HealthCheckJobArgsDto,
  async run(args, log) {
    const unhealthy: HealthIntegration[] = [];
    const alert = args.notify ? log.error : log.warning;

    for (const name of args.integrations ?? HEALTH_INTEGRATIONS) {
      let status: ApiHealthStatus;
      try {
        status = await checks[name]();
      } catch (err) {
        status = ApiHealthStatus.UNHEALTHY;
        alert(
          `Health check failed for ${name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }

      if (status === ApiHealthStatus.HEALTHY) {
        log.info(`✓ ${name} healthy`);
      } else if (status === ApiHealthStatus.DISABLED) {
        log.info(`- ${name} disabled`);
      } else {
        unhealthy.push(name);
        alert(`✗ ${name} unhealthy`);
      }
    }

    if (unhealthy.length > 0) {
      throw new Error(`Unhealthy integrations: ${unhealthy.join(', ')}`);
    }
  },
};
