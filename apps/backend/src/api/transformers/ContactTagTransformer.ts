import {
  ContactTagFilterName,
  Filters,
  RoleType,
  contactTagFilters,
} from '@beabee/beabee-common';
import { ContactTag, ContactTagAssignment } from '@beabee/core/models';

import { GetContactTagDto } from '#api/dto';

import BaseTagTransformer from './BaseTagTransformer';

class ContactTagTransformer extends BaseTagTransformer<
  ContactTag,
  GetContactTagDto,
  ContactTagFilterName
> {
  protected model = ContactTag;
  protected filters: Filters<ContactTagFilterName> = contactTagFilters;
  protected dtoType = GetContactTagDto;
  protected assignmentModel = ContactTagAssignment;
  protected entityIdField = 'contactId';
}

export default new ContactTagTransformer();
