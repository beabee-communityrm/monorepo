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
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { NewsletterGroupDto } from './NewsletterDto.js';

export enum GetNewsletterIntegrationWith {
  Health = 'health',
}

export class GetNewsletterIntegrationOptsDto {
  @IsOptional()
  @IsEnum(GetNewsletterIntegrationWith, { each: true })
  with?: GetNewsletterIntegrationWith[];
}

export class NoneNewsletterIntegrationDto implements NoneNewsletterIntegrationData {
  @Equals('none')
  provider!: 'none';

  @IsOptional()
  @IsIn([ApiHealthStatus.DISABLED])
  status?: ApiHealthStatus.DISABLED;
}

export class MailchimpNewsletterIntegrationDto implements MailchimpNewsletterIntegrationData {
  @Equals('mailchimp')
  provider!: 'mailchimp';

  @IsString()
  audienceId!: string;

  @IsOptional()
  @IsEnum(ApiHealthStatus)
  status?: ApiHealthStatus;

  @ValidateNested({ each: true })
  @Type(() => NewsletterGroupDto)
  groups!: NewsletterGroupDto[];
}

export type NewsletterIntegrationDto =
  | NoneNewsletterIntegrationDto
  | MailchimpNewsletterIntegrationDto;
