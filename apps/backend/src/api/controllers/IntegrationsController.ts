import { ApiHealthStatus } from '@beabee/beabee-common';
import NewsletterService from '@beabee/core/services/NewsletterService';

import { plainToInstance } from 'class-transformer';
import {
  Authorized,
  Get,
  JsonController,
  Post,
  QueryParams,
} from 'routing-controllers';

import { NewsletterDiffDto } from '#api/dto/NewsletterDiffDto';
import {
  GetNewsletterIntegrationOptsDto,
  GetNewsletterIntegrationWith,
  NewsletterIntegrationDto,
  NoneNewsletterIntegrationDto,
} from '#api/dto/NewsletterIntegrationDto';

@JsonController('/integrations')
@Authorized('admin')
export class IntegrationsController {
  @Get('/newsletter')
  async getNewsletterStatus(
    @QueryParams() query: GetNewsletterIntegrationOptsDto
  ): Promise<NewsletterIntegrationDto> {
    const info = await NewsletterService.getProviderInfo(
      query.with?.includes(GetNewsletterIntegrationWith.Health)
    );
    return plainToInstance(NoneNewsletterIntegrationDto, { info });
  }

  @Post('/newsletter/refresh')
  async refreshGroups(): Promise<NewsletterDiffDto> {
    const groupDiff = await NewsletterService.refreshNewsletterGroups();
    return plainToInstance(NewsletterDiffDto, { groupDiff });
  }
}
