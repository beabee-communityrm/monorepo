import { GetPaginatedQuery } from '#api/dto/BaseDto';
import { IsBoolean, IsIn, IsString, ValidateNested } from 'class-validator';

import { GetContactDto } from './ContactDto';

export class CreateCalloutReviewerDto {
  @IsString()
  contactId!: string;

  @IsBoolean()
  canEdit!: boolean;
}

export class GetCalloutReviewerDto {
  @IsString()
  id!: string;

  @ValidateNested()
  contact!: GetContactDto;

  @IsBoolean()
  canEdit!: boolean;
}

export class UpdateCalloutReviewerDto {
  @IsBoolean()
  canEdit!: boolean;
}

export class ListCalloutReviewersDto extends GetPaginatedQuery {
  // No sort fields for now
  @IsIn([])
  sort?: string;
}
