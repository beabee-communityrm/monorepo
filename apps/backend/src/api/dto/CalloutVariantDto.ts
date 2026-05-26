import {
  CalloutVariantData,
  CalloutVariantNavigationData,
} from '@beabee/beabee-common';

import { IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class CalloutVariantDto implements CalloutVariantData {
  @IsString()
  title!: string;

  @IsString()
  excerpt!: string;

  @IsString()
  intro!: string;

  @IsString()
  thanksTitle!: string;

  @IsString()
  thanksText!: string;

  @IsOptional()
  @IsUrl()
  thanksRedirect!: string | null;

  @IsOptional()
  @IsString()
  shareTitle!: string | null;

  @IsOptional()
  @IsString()
  shareDescription!: string | null;

  @IsObject() // TODO
  slideNavigation!: Record<string, CalloutVariantNavigationData>;

  @IsObject() // TODO
  componentText!: Record<string, string>;

  @IsObject() // TODO
  responseLinkText!: Record<string, string>;

  @IsOptional()
  @IsString()
  responseEmailSubject!: string | null;

  @IsOptional()
  @IsString()
  responseEmailBody!: string | null;
}
