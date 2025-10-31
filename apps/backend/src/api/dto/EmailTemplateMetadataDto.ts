import { EmailTemplateType } from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';

/**
 * Metadata for a single email template
 */
export class EmailTemplateMetadataDto {
  @IsString()
  id!: string;

  @IsEnum(EmailTemplateType)
  type!: EmailTemplateType;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  mergeFields!: string[];
}

/**
 * Response for template metadata endpoint
 */
export class GetEmailTemplatesMetadataDto {
  @ValidateNested({ each: true })
  @Type(() => EmailTemplateMetadataDto)
  @IsArray()
  templates!: EmailTemplateMetadataDto[];
}
