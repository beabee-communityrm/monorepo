import { ContactProfile } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';

import { GetContactProfileDto } from '#api/dto/ContactProfileDto';
import AddressTransformer from '#api/transformers/AddressTransformer';
import { BaseTransformer } from '#api/transformers/BaseTransformer';

/** The profile's own fields; the newsletter fields are added by ContactTransformer */
type GetContactProfileOwnDto = Omit<
  GetContactProfileDto,
  'newsletterStatus' | 'newsletterGroups'
>;

class ContactProfileTransformer extends BaseTransformer<
  ContactProfile,
  GetContactProfileOwnDto
> {
  protected model = ContactProfile;
  protected filters = {};

  @TransformPlainToInstance(GetContactProfileDto)
  convert(profile: ContactProfile, auth: AuthInfo): GetContactProfileOwnDto {
    return {
      telephone: profile.telephone,
      twitter: profile.twitter,
      organisation: profile.organisation,
      vatNumber: profile.vatNumber,
      preferredContact: profile.preferredContact,
      deliveryOptIn: profile.deliveryOptIn,
      deliveryAddress:
        profile.deliveryAddress &&
        AddressTransformer.convert(profile.deliveryAddress),
      ...(auth.roles.includes('admin') && {
        notes: profile.notes,
        description: profile.description,
      }),
    };
  }
}

export default new ContactProfileTransformer();
