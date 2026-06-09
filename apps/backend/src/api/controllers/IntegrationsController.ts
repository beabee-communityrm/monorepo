import NewsletterService from '@beabee/core/services/NewsletterService';

import { Authorized, Get, JsonController, Post } from 'routing-controllers';

import { NewsletterDiffDto } from '#api/dto/NewsletterDiffDto';
import { NewsletterIntegrationDto } from '#api/dto/NewsletterIntegrationDto';

@JsonController('/integrations')
@Authorized('admin')
export class IntegrationsController {
  @Get('/newsletter')
  async getNewsletter(): Promise<NewsletterIntegrationDto> {
    return await NewsletterService.getProviderInfo();
  }

  @Post('/newsletter/refresh')
  async refreshGroups(): Promise<NewsletterDiffDto> {
    return await NewsletterService.refreshNewsletterGroups();
  }
}
