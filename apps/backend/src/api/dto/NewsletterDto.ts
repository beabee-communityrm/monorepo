import { NewsletterGroupData } from '@beabee/beabee-common';
import { IsBoolean, IsString } from 'class-validator';

export class NewsletterGroupDto implements NewsletterGroupData {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsBoolean()
  checked!: boolean;
}
