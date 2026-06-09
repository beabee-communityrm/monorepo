import { GroupChanges, NewsletterDiffData } from '@beabee/beabee-common';

import { Type } from 'class-transformer';
import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';

import { NewsletterIntegrationDto } from './NewsletterIntegrationDto.js';

class GroupChangesDto implements GroupChanges {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsIn(['added', 'removed'])
  action!: 'added' | 'removed';
}

export class NewsletterDiffDto implements NewsletterDiffData {
  info!: NewsletterIntegrationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupChangesDto)
  groupChanges!: GroupChangesDto[];
}
