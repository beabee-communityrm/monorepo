import { IsIn, IsString, IsUUID } from "class-validator";

import { GetPaginatedQuery } from "@api/dto/BaseDto";

export class GetContactTagDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}

export class CreateContactTagDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;
}

export class ListContactTagsDto extends GetPaginatedQuery {
  @IsIn(["id", "name"])
  sort?: string;
}
