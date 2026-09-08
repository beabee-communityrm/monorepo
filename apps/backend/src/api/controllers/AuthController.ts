import { LOGIN_CODES, RoleType, RoleTypes } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { NotFoundError, UnauthorizedError } from '@beabee/core/errors';
import {
  completeOidcLogin,
  getOidcLogoutUrl,
  isOidcEnabled,
  startOidcLogin,
} from '@beabee/core/lib/oidc';
import passport from '@beabee/core/lib/passport';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact, ContactRole } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import { AuthInfo, PassportLoginInfo } from '@beabee/core/type';
import { isValidNextUrl } from '@beabee/core/utils/url';

import { isUUID } from 'class-validator';
import { Request, Response } from 'express';
import {
  Body,
  Get,
  HttpError,
  JsonController,
  OnUndefined,
  Param,
  Post,
  QueryParam,
  Req,
  Res,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import { GetAuthInfoDto, LoginDto } from '#api/dto';
import { authTransformer } from '#api/transformers';
import { assertPasswordAuthEnabled, login } from '#api/utils/auth';

const log = mainLogger.child({ app: 'auth-controller' });

@JsonController('/auth')
export class AuthController {
  /**
   * Redirect and return the response so routing-controllers treats it as
   * handled instead of serialising it as JSON
   */
  private redirect(res: Response, url: string): Response {
    res.redirect(url);
    return res;
  }

  private redirectToLoginError(res: Response, code: LOGIN_CODES): Response {
    return this.redirect(res, `${config.audience}/auth/login?error=${code}`);
  }

  @OnUndefined(204)
  @Post('/login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    /** Just used for validation (`email`, `password` and `req.data.token` are in passport strategy) */
    @Body() _: LoginDto
  ): Promise<void> {
    assertPasswordAuthEnabled();

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

  /**
   * Browser-facing OIDC login: redirects to the identity provider
   * @param next Internal path to continue to after login
   */
  @Get('/login')
  async oidcLogin(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam('next') next?: string
  ): Promise<Response> {
    if (!isOidcEnabled()) {
      throw new NotFoundError();
    }

    try {
      const { url, loginState } = await startOidcLogin(
        next && isValidNextUrl(next) ? next : undefined
      );
      req.session.oidc = loginState;
      return this.redirect(res, url);
    } catch (err) {
      log.error('OIDC login failed to start', err);
      return this.redirectToLoginError(res, LOGIN_CODES.LOGIN_FAILED);
    }
  }

  /**
   * OIDC callback: exchanges the authorization code and logs in the contact
   * linked to the identity provider subject
   */
  @Get('/callback')
  async oidcCallback(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    if (!isOidcEnabled()) {
      throw new NotFoundError();
    }

    const loginState = req.session.oidc;
    delete req.session.oidc;

    try {
      if (!loginState) {
        throw new Error('No OIDC login in progress for this session');
      }

      const { subject, idToken } = await completeOidcLogin(
        new URL(req.originalUrl, config.audience).search,
        loginState
      );

      const contact = await ContactsService.findOneBy({ idpSubject: subject });
      if (!contact) {
        log.info(`OIDC login for unlinked subject ${subject}`);
        return this.redirectToLoginError(res, LOGIN_CODES.UNLINKED_ACCOUNT);
      }

      // Regenerates the session, dropping the pre-login state
      await login(req, contact);
      req.session.idToken = idToken;

      return this.redirect(res, config.audience + (loginState.next || '/'));
    } catch (err) {
      log.error('OIDC login failed', err);
      return this.redirectToLoginError(res, LOGIN_CODES.LOGIN_FAILED);
    }
  }

  /**
   * Browser-facing logout: ends the beabee session and the identity provider
   * session (RP-initiated logout)
   */
  @Get('/logout')
  async oidcLogout(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    if (!isOidcEnabled()) {
      throw new NotFoundError();
    }

    const idToken = req.session.idToken;

    await new Promise<void>((resolve, reject) =>
      req.logout((err) => (err ? reject(err) : resolve()))
    );
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));

    return this.redirect(res, await getOidcLogoutUrl(idToken));
  }

  @Get('/info')
  async getAuthInfo(
    @CurrentAuth({ required: false }) auth: AuthInfo
  ): Promise<GetAuthInfoDto> {
    return authTransformer.convert(auth);
  }
}
