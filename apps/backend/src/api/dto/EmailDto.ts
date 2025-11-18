import { Locale } from '@beabee/locale';

import { GetPaginatedQuery } from '@api/dto/BaseDto';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}

export class GetEmailDto extends UpdateEmailDto {}

/**
 * DTO for creating custom emails
 */
export class CreateEmailDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}

/**
 * DTO for listing emails with pagination
 */
export class ListEmailsDto extends GetPaginatedQuery {}

/**
 * DTO for email with full metadata
 */
export class GetEmailWithMetadataDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  fromName!: string | null;

  @IsOptional()
  @IsString()
  fromEmail!: string | null;

  @IsString()
  subject!: string;

  @IsString()
  body!: string;

  @IsString()
  date!: string;

  @IsArray()
  @IsString({ each: true })
  assignedTemplates!: string[];

  @IsOptional()
  mailingCount?: number;
}

/**
 * DTO for email template metadata
 * Note: Template names and merge field descriptions are handled in the frontend via translations
 */
export class GetEmailTemplateInfoDto {
  @IsString()
  id!: string;

  @IsString()
  type!: 'general' | 'admin' | 'contact';

  @IsArray()
  @IsString({ each: true })
  mergeFields!: string[];

  @IsOptional()
  showContactFields?: boolean;

  @IsOptional()
  @IsString()
  overrideEmailId?: string;
}

/**
 * DTO for assigning a template to an email
 */
export class AssignTemplateDto {
  @IsOptional()
  @IsString()
  emailId!: string | null;
}

/**
 * DTO for previewing email templates
 * Supports custom merge fields and locale selection
 */
export class PreviewEmailDto {
  @IsOptional()
  @IsString()
  customSubject?: string;

  /**
   * Optional body to override the template's body for preview
   * When provided, this body will be used instead of the saved template body,
   * allowing preview of unsaved changes. Merge fields will still be replaced.
   */
  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsObject()
  mergeFields?: Record<string, string>;

  @IsOptional()
  @IsString()
  locale?: Locale;
}
