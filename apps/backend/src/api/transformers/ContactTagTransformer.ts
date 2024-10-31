import { ContactTag } from "@beabee/core/models";
import { GetContactTagDto } from "@api/dto/ContactTagDto";
import { BaseTransformer } from "./BaseTransformer";
import {
  ContactTagFilterName,
  contactTagFilters,
  RoleType
} from "@beabee/beabee-common";
import { TransformPlainToInstance } from "class-transformer";

class ContactTagTransformer extends BaseTransformer<
  ContactTag,
  GetContactTagDto,
  ContactTagFilterName
> {
  protected model = ContactTag;
  protected filters = contactTagFilters;

  protected allowedRoles: RoleType[] = ["admin"];

  @TransformPlainToInstance(GetContactTagDto)
  convert(tag: ContactTag): GetContactTagDto {
    return {
      id: tag.id,
      name: tag.name
    };
  }
}

export default new ContactTagTransformer();
