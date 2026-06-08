import {
  ApiHealthStatus,
  MailchimpNewsletterIntegrationData,
  NoneNewsletterIntegrationData,
} from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsString, ValidateNested } from 'class-validator';

import { NewsletterGroupDto } from './NewsletterDto.js';

export class NoneNewsletterIntegrationDto implements NoneNewsletterIntegrationData {
  @IsIn(['none'])
  provider!: 'none';

  @IsIn([ApiHealthStatus.DISABLED])
  status!: ApiHealthStatus.DISABLED;
}

export class MailchimpNewsletterIntegrationDto implements MailchimpNewsletterIntegrationData {
  @IsIn(['mailchimp'])
  provider!: 'mailchimp';

  @IsString()
  audienceId!: string;

  @IsEnum(ApiHealthStatus)
  status!: ApiHealthStatus;

  @ValidateNested({ each: true })
  @Type(() => NewsletterGroupDto)
  groups!: NewsletterGroupDto[];
}

export type NewsletterIntegrationDto =
  | NoneNewsletterIntegrationDto
  | MailchimpNewsletterIntegrationDto;
