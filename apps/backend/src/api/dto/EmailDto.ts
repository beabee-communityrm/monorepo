import { Locale } from '@beabee/locale';

import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { GetPaginatedQuery } from './BaseDto';

export class UpdateEmailDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}

export class GetEmailDto extends UpdateEmailDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  date!: string;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @IsString()
  @IsOptional()
  systemTemplateId?: string;
}

/**
 * DTO for email list items
 * Includes metadata about system email overrides and segment usage
 */
export class GetEmailListItemDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  subject!: string;

  @IsString()
  date!: string;

  @IsNumber()
  mailingCount!: number;

  @IsBoolean()
  isSystem!: boolean;

  @IsBoolean()
  isSegment!: boolean;
}

/**
 * DTO for listing emails with pagination
 */
export class ListEmailsDto extends GetPaginatedQuery {
  @IsOptional()
  @IsIn(['name', 'date'])
  sort?: string;
}

/**
 * DTO for previewing email templates
 * Supports custom merge fields and locale selection
 */
export class PreviewEmailDto {
  @IsOptional()
  @IsString()
  customSubject?: string;

  @IsOptional()
  @IsObject()
  mergeFields?: Record<string, string>;

  @IsOptional()
  @IsString()
  locale?: Locale;
}

/**
 * DTO for email preview response
 * Contains only subject and body for preview purposes
 */
export class EmailPreviewDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}
