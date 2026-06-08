import NewsletterService from '@beabee/core/services/NewsletterService';

import { Authorized, Get, JsonController, Post } from 'routing-controllers';

import { NewsletterIntegrationDto } from '#api/dto/NewsletterIntegrationDto';

@JsonController('/integrations')
@Authorized('admin')
export class IntegrationsController {
  @Get('/newsletter')
  async getNewsletter(): Promise<NewsletterIntegrationDto> {
    return await NewsletterService.getProviderInfo();
  }
}
