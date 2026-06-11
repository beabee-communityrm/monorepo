import {
  ApiHealthStatus,
  MailchimpNewsletterIntegrationData,
  NoneNewsletterIntegrationData,
} from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import {
  Equals,
  IsEnum,
  IsIn,
  IsString,
  ValidateNested,
} from 'class-validator';

import { NewsletterGroupDto } from './NewsletterDto.js';

export class NoneNewsletterIntegrationDto implements NoneNewsletterIntegrationData {
  @Equals('none')
  provider!: 'none';

  @IsIn([ApiHealthStatus.DISABLED])
  status!: ApiHealthStatus.DISABLED;
}

export class MailchimpNewsletterIntegrationDto implements MailchimpNewsletterIntegrationData {
  @Equals('mailchimp')
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
