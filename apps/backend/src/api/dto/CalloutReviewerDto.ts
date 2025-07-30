import { GetPaginatedQuery } from '@api/dto/BaseDto';
import { IsDate, IsIn, IsString, ValidateNested } from 'class-validator';

import { GetContactDto } from './ContactDto';

export class CreateCalloutReviewerDto {
  @IsString()
  contactId!: string;
}

export class GetCalloutReviewerDto {
  @IsString()
  id!: string;

  @ValidateNested()
  contact!: GetContactDto;
}

export class ListCalloutReviewersDto extends GetPaginatedQuery {
  // No sort fields for now
  @IsIn([])
  sort?: string;
}
