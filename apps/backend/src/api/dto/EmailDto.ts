import { EmailTemplateType } from '@beabee/beabee-common';
import {
  AdminEmailTemplateId,
  ContactEmailTemplateId,
  EmailTemplateId,
  GeneralEmailTemplateId,
} from '@beabee/core/type';

import { GetPaginatedQuery } from '@api/dto/BaseDto';
import IsEmailTemplateId from '@api/validators/IsEmailTemplateId';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO for email preview responses
 * Contains rendered subject and body with merge fields replaced
 */
export class EmailPreviewDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}

export class PreviewAdminEmailParams {
  @IsEmailTemplateId('admin')
  templateId!: AdminEmailTemplateId;
}

export class PreviewContactEmailParams {
  @IsEmailTemplateId('contact')
  templateId!: ContactEmailTemplateId;
}

export class PreviewGeneralEmailParams {
  @IsEmailTemplateId('general')
  templateId!: GeneralEmailTemplateId;
}

export class UpdateEmailTemplateParams {
  @IsEmailTemplateId()
  templateId!: EmailTemplateId;
}

export class DeleteEmailTemplateParams extends UpdateEmailTemplateParams {}

export class GetEmailTemplateParams extends UpdateEmailTemplateParams {}

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
 * DTO for updating custom emails
 */
export class UpdateEmailDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;
}

/**
 * DTO for listing emails with pagination
 */
export class ListEmailsDto extends GetPaginatedQuery {}

/**
 * DTO for email entity with full metadata
 * Used for CRUD operations on email entities
 */
export class GetEmailDto extends CreateEmailDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsString()
  date!: string;

  @IsOptional()
  mailingCount?: number;
}

/**
 * DTO for email template metadata
 * Used for the system templates list view
 */
export class GetEmailTemplateInfoDto {
  @IsString()
  id!: string;

  @IsString()
  type!: EmailTemplateType;

  @IsArray()
  @IsString({ each: true })
  mergeFields!: readonly string[];

  hasOverride!: boolean;

  hasDefaultTemplate!: boolean;

  @IsString()
  subject!: string;
}

/**
 * DTO for previewing email templates
 * Supports custom merge fields and locale selection
 */
export class PreviewEmailDto {
  @IsOptional()
  @IsString()
  subject?: string;

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
}
