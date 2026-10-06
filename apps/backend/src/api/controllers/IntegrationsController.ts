import ContactSyncService from '@beabee/core/services/ContactSyncService';
import NewsletterService from '@beabee/core/services/NewsletterService';

import { plainToInstance } from 'class-transformer';
import {
  Authorized,
  Get,
  JsonController,
  Post,
  QueryParams,
} from 'routing-controllers';

import {
  ContactSyncIntegrationDto,
  GetContactSyncIntegrationOptsDto,
  GetContactSyncIntegrationWith,
  NoneContactSyncIntegrationDto,
  SalesforceContactSyncIntegrationDto,
} from '#api/dto/ContactSyncIntegrationDto';
import { NewsletterDiffDto } from '#api/dto/NewsletterDiffDto';
import {
  GetNewsletterIntegrationOptsDto,
  GetNewsletterIntegrationWith,
  MailchimpNewsletterIntegrationDto,
  NewsletterIntegrationDto,
  NoneNewsletterIntegrationDto,
  TestNewsletterIntegrationDto,
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
    switch (info.provider) {
      case 'mailchimp':
        return plainToInstance(MailchimpNewsletterIntegrationDto, info);
      case 'test':
        return plainToInstance(TestNewsletterIntegrationDto, info);
      default:
        return plainToInstance(NoneNewsletterIntegrationDto, info);
    }
  }

  @Get('/contact-sync')
  async getContactSyncStatus(
    @QueryParams() query: GetContactSyncIntegrationOptsDto
  ): Promise<ContactSyncIntegrationDto> {
    const info = await ContactSyncService.getProviderInfo(
      query.with?.includes(GetContactSyncIntegrationWith.Health)
    );
    return info.provider === 'salesforce'
      ? plainToInstance(SalesforceContactSyncIntegrationDto, info)
      : plainToInstance(NoneContactSyncIntegrationDto, info);
  }

  @Post('/newsletter/refresh')
  async refreshGroups(): Promise<NewsletterDiffDto> {
    const groupDiff = await NewsletterService.refreshNewsletterGroups();
    return plainToInstance(NewsletterDiffDto, groupDiff);
  }
}
