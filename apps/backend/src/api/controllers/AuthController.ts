import { AuthInfo } from '@beabee/core/type';

import { Get, JsonController } from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import { GetAuthInfoDto } from '#api/dto';
import { authTransformer } from '#api/transformers';

// Login and logout are handled by the OIDC routes, see apps/backend/src/api/auth.ts
@JsonController('/auth')
export class AuthController {
  @Get('/info')
  async getAuthInfo(
    @CurrentAuth({ required: false }) auth: AuthInfo
  ): Promise<GetAuthInfoDto> {
    return authTransformer.convert(auth);
  }
}
