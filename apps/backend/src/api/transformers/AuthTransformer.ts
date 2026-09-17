import { getSelfServiceUrls, isOidcEnabled } from '@beabee/core/lib/oidc';
import { Contact } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';

import { GetAuthInfoDto } from '#api/dto';

import ContactTransformer, { loadContactRoles } from './ContactTransformer.js';

class AuthTransformer {
  /**
   * Converts auth info and transforms nested contact data
   * @param auth - The raw auth info
   * @param idpLoginName - The member's login name at the identity provider
   * @returns Transformed auth info with properly converted contact data
   */
  @TransformPlainToInstance(GetAuthInfoDto)
  convert(auth: AuthInfo, idpLoginName?: string): GetAuthInfoDto {
    if (!auth.contact) {
      return {
        method: auth.method,
        roles: auth.roles,
      };
    }
    return {
      ...auth,
      contact: ContactTransformer.convert(auth.contact, auth),
      ...(isOidcEnabled() &&
        idpLoginName && { selfService: getSelfServiceUrls(idpLoginName) }),
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
