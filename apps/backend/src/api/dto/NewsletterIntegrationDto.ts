import {
  ApiHealthStatus,
  NewsletterIntegrationData,
} from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { NewsletterGroupDto } from './NewsletterDto.js';

export class NewsletterIntegrationDto implements NewsletterIntegrationData {
  @IsString()
  provider!: string;

  @IsString()
  @IsOptional()
  audienceId?: string;

  @IsEnum(ApiHealthStatus)
  status!: ApiHealthStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NewsletterGroupDto)
  groups?: NewsletterGroupDto[];
}
