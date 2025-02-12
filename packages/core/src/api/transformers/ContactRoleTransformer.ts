import { BaseTransformer } from "./BaseTransformer";
import { TransformPlainToInstance } from "class-transformer";

import { GetContactRoleDto } from "../dto/ContactRoleDto";

import { ContactRole } from "@beabee/core/models";

class ContactRoleTransformer extends BaseTransformer<
  ContactRole,
  GetContactRoleDto
> {
  protected model = ContactRole;
  protected filters = {};

  @TransformPlainToInstance(GetContactRoleDto)
  convert(role: ContactRole): GetContactRoleDto {
    return {
      role: role.type,
      dateAdded: role.dateAdded,
      dateExpires: role.dateExpires
    };
  }
}

export const contactRoleTransformer = new ContactRoleTransformer();
