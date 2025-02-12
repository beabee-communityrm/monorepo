import { TransformPlainToInstance } from "class-transformer";

import { GetContactProfileDto } from "../dto/ContactProfileDto";
import { addressTransformer } from "./AddressTransformer";
import { BaseTransformer } from "./BaseTransformer";

import { ContactProfile } from "@beabee/core/models";

import { AuthInfo } from "@beabee/core/type";

class ContactProfileTransformer extends BaseTransformer<
  ContactProfile,
  GetContactProfileDto
> {
  protected model = ContactProfile;
  protected filters = {};

  @TransformPlainToInstance(GetContactProfileDto)
  convert(profile: ContactProfile, auth: AuthInfo): GetContactProfileDto {
    return {
      telephone: profile.telephone,
      twitter: profile.twitter,
      preferredContact: profile.preferredContact,
      deliveryOptIn: profile.deliveryOptIn,
      deliveryAddress:
        profile.deliveryAddress &&
        addressTransformer.convert(profile.deliveryAddress),
      newsletterStatus: profile.newsletterStatus,
      newsletterGroups: profile.newsletterGroups,
      ...(auth.roles.includes("admin") && {
        notes: profile.notes,
        description: profile.description
      })
    };
  }
}

export const contactProfileTransformer = new ContactProfileTransformer();
