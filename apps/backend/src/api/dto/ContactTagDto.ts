import { IsString, IsUUID } from "class-validator";
import { CreateTagDto, GetTagDto, ListTagsDto } from "./TagDto";

/**
 * The contact tag DTO
 *
 * These tags are only visible to admins. This is enforced here due to
 * limitations in class-validator
 *
 * 1) It should be in GetContactDto, but group validation with ValidateNested
 *    doesn't work
 * 2) We should at least be able to extend GetTagDto instead of implementing it,
 *    but adding groups via inheritance doesn't work
 */
export class GetContactTagDto implements GetTagDto {
  @IsUUID(undefined, { groups: ["admin"] })
  id!: string;

  @IsString()
  name!: string;
}

export class CreateContactTagDto extends CreateTagDto {}

export class ListContactTagsDto extends ListTagsDto {}
