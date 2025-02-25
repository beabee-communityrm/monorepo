import { AuthInfo } from "@beabee/core/type";
import { contactTransformer, loadContactRoles } from "./ContactTransformer";
import { Contact } from "@beabee/core/models";
import { GetAuthInfoDto } from "@beabee/core/api/dto";
import { TransformPlainToInstance } from "class-transformer";

class AuthTransformer {
  /**
   * Converts auth info and transforms nested contact data
   * @param auth - The raw auth info
   * @returns Transformed auth info with properly converted contact data
   */
  @TransformPlainToInstance(GetAuthInfoDto)
  convert(auth: AuthInfo): GetAuthInfoDto {
    if (!auth.contact) {
      return {
        method: auth.method,
        roles: auth.roles
      };
    }
    return {
      ...auth,
      contact: contactTransformer.convert(auth.contact, auth)
    };
  }

  /**
   * Loads additional contact data for auth info
   * @param auth - The auth info to modify
   */
  async loadAdditionalData(auth: AuthInfo): Promise<void> {
    if (auth.contact) {
      await loadContactRoles([auth.contact as Contact]);
    }
  }
}

export const authTransformer = new AuthTransformer();
