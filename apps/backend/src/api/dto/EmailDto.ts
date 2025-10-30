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

  @IsOptional()
  @IsObject()
  mergeFields?: Record<string, string>;

  @IsOptional()
  @IsString()
  locale?: Locale;
}
