import { ApiHealthStatus } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import NewsletterService from '@beabee/core/services/NewsletterService';

import { Authorized, Get, JsonController } from 'routing-controllers';

import { NewsletterIntegrationDto } from '#api/dto/NewsletterIntegrationDto';

@JsonController('/integrations')
export class IntegrationsController {
  @Authorized('admin')
  @Get('/newsletter')
  async getNewsletter(): Promise<NewsletterIntegrationDto> {
    const provider = config.newsletter.provider;

    if (provider === 'none') {
      return {
        provider,
        status: ApiHealthStatus.DISABLED,
      };
    }

    const health = await NewsletterService.getHealthStatus();
    return {
      provider,
      status:
        health === 'healthy'
          ? ApiHealthStatus.HEALTHY
          : ApiHealthStatus.UNHEALTHY,
      audienceId: config.newsletter.settings.listId,
    };
  }
}
