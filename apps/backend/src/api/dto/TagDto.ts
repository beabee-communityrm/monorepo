import { GetPaginatedQuery } from '@api/dto/BaseDto';
import { IsIn, IsString, IsUUID } from 'class-validator';

export class GetTagDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}

export class CreateTagDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;
}

export class ListTagsDto extends GetPaginatedQuery {
  @IsIn(['id', 'name'])
  sort?: string;
}
