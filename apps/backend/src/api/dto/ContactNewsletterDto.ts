import { NewsletterStatus } from '@beabee/beabee-common';

import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class GetContactNewsletterDto {
  @IsEnum(NewsletterStatus)
  status!: NewsletterStatus;

  @IsArray()
  @IsString({ each: true })
  groups!: string[];
}

export class UpdateContactNewsletterDto implements Partial<GetContactNewsletterDto> {
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;

  @IsOptional()
  @IsString({ each: true })
  groups?: string[];
}
