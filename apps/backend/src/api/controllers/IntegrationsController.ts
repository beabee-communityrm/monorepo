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
    const health = await NewsletterService.getHealthStatus();
    const groups = await NewsletterService.getGroups();

    if (provider === 'none') {
      return {
        provider,
        status: ApiHealthStatus.DISABLED,
        groups: groups.map((g) => ({ ...g, checked: false })),
      };
    }

    return {
      provider,
      status:
        health === 'healthy'
          ? ApiHealthStatus.HEALTHY
          : ApiHealthStatus.UNHEALTHY,
      audienceId: config.newsletter.settings.listId,
      groups: groups.map((g) => ({ ...g, checked: false })),
    };
  }
}
