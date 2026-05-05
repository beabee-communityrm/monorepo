import type { RoleType } from '@beabee/beabee-common';
import { LOGIN_CODES, RoleTypes } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { NotFoundError, UnauthorizedError } from '@beabee/core/errors';
import passport from '@beabee/core/lib/passport';
import type { Contact } from '@beabee/core/models';
import { ContactRole } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import type { AuthInfo, PassportLoginInfo } from '@beabee/core/type';

import { isUUID } from 'class-validator';
import type { Request, Response } from 'express';
import {
  Body,
  Get,
  HttpError,
  JsonController,
  OnUndefined,
  Param,
  Post,
  Req,
  Res,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import type { GetAuthInfoDto, LoginDto } from '#api/dto';
import { authTransformer } from '#api/transformers';
import { login } from '#api/utils/auth';

@JsonController('/auth')
export class AuthController {
  @OnUndefined(204)
  @Post('/login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    /** Just used for validation (`email`, `password` and `req.data.token` are in passport strategy) */
    @Body() _: LoginDto
  ): Promise<void> {
    const user = await new Promise<Contact>((resolve, reject) => {
      passport.authenticate(
        'local',
        async (
          err: null | HttpError | UnauthorizedError,
          user: Contact | false,
          info?: PassportLoginInfo
        ) => {
          // Forward HTTP errors
          if (err) {
            if (err instanceof HttpError) {
              return reject(err);
            }
          }

          // Unknown errors
          if (err || !user) {
            return reject(
              new UnauthorizedError(LOGIN_CODES.LOGIN_FAILED, info?.message)
            );
          }

          // Looks good, return user
          resolve(user);
        }
      )(req, res);
    });

    // If there is no error thrown, login
    await login(req, user); // Why do we have to login after authenticate?
  }

  @OnUndefined(204)
  @Post('/logout')
  async logout(@Req() req: Request): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      req.logout((err) => {
        if (err) reject(err);
        else resolve();
      })
    );
  }

  @Get('/info')
  async getAuthInfo(
    @CurrentAuth({ required: false }) auth: AuthInfo
  ): Promise<GetAuthInfoDto> {
    return authTransformer.convert(auth);
  }
}
