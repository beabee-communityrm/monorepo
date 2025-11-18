import { Locale } from '@beabee/locale';

import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;
}

export class GetEmailDto extends UpdateEmailDto {}

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
