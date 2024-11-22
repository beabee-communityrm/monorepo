import { GetContactTagDto } from "@api/dto";
import {
  ContactTagFilterName,
  Filters,
  contactTagFilters,
  RoleType
} from "@beabee/beabee-common";
import { ContactTag, ContactTagAssignment } from "@beabee/core/models";
import BaseTagTransformer from "./BaseTagTransformer";
import { AuthInfo } from "@type/auth-info";

class ContactTagTransformer extends BaseTagTransformer<
  ContactTag,
  GetContactTagDto,
  ContactTagFilterName
> {
  protected model = ContactTag;
  protected filters: Filters<ContactTagFilterName> = contactTagFilters;
  protected dtoType = GetContactTagDto;
  protected assignmentModel = ContactTagAssignment;
  protected entityIdField = "contactId";

  protected allowedRoles: RoleType[] = ["admin"];
}

export default new ContactTagTransformer();
