import {
  AdminEmailTemplateId,
  ContactEmailTemplateId,
  GeneralEmailTemplateId,
} from '@beabee/core/type';

import { GetPaginatedQuery } from '@api/dto/BaseDto';
import IsEmailTemplateId from '@api/validators/IsEmailTemplateId';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}

/**
 * DTO for email preview responses
 * Contains rendered subject and body with merge fields replaced
 */
export class EmailPreviewDto extends UpdateEmailDto {}

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
 * DTO for email entity with full metadata
 * Used for CRUD operations on email entities
 */
export class GetEmailDto {
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
