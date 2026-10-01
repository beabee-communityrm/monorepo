import { LOGIN_CODES, RoleType, RoleTypes } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import {
  NotFoundError,
  OidcLoginDeniedError,
  UnauthorizedError,
} from '@beabee/core/errors';
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
import { GetAuthInfoDto, LoginDto, LogoutResultDto } from '#api/dto';
import { authTransformer } from '#api/transformers';
import {
  assertOidcAuthEnabled,
  assertPasswordAuthEnabled,
  login,
} from '#api/utils/auth';

const log = mainLogger.child({ app: 'auth-controller' });

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

  /**
   * Ends the beabee session. Under OIDC login the response carries the
   * identity provider's logout URL for the client to navigate to, because
   * the IdP session would otherwise log the member straight back in.
   */
  @OnUndefined(204)
  @Post('/logout')
  async logout(@Req() req: Request): Promise<LogoutResultDto | undefined> {
    const idToken = req.session.idToken;
    await new Promise<void>((resolve, reject) =>
      req.logout((err) => {
        if (err) reject(err);
        else resolve();
      })
    );

    if (isOidcEnabled()) {
      await new Promise<void>((resolve) =>
        req.session.destroy(() => resolve())
      );
      // Only a session that came through the OIDC callback has an IdP
      // session to end; anything else is done with the 204
      if (idToken) {
        return { redirectUrl: await getOidcLogoutUrl(idToken) };
      }
    }
  }

  /**
   * Browser-facing OIDC login: redirects to the identity provider. The GET
   * routes below return the response so routing-controllers treats it as
   * handled instead of serialising it as JSON.
   * @param next Internal path to continue to after login
   */
  @Get('/login')
  async oidcLogin(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParam('next', { required: false }) next?: string
  ): Promise<Response> {
    assertOidcAuthEnabled();

    try {
      const { url, loginState } = await startOidcLogin(
        next && isValidNextUrl(next) ? next : undefined
      );
      req.session.oidc = loginState;
      res.redirect(url);
      return res;
    } catch (err) {
      log.error('OIDC login failed to start', err);
      res.redirect(
        `${config.audience}/auth/login?loginError=${LOGIN_CODES.LOGIN_FAILED}`
      );
      return res;
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
    assertOidcAuthEnabled();

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
        // End the IdP session on the way to the error page, otherwise the
        // next login attempt lands on the same error without a login form
        res.redirect(
          await getOidcLogoutUrl(
            idToken,
            `${config.audience}/auth/login?loginError=${LOGIN_CODES.UNLINKED_ACCOUNT}`
          )
        );
        return res;
      }

      // Regenerates the session, dropping the pre-login state
      await login(req, contact);
      req.session.idToken = idToken;

      res.redirect(config.audience + (loginState.next || '/'));
      return res;
    } catch (err) {
      if (err instanceof OidcLoginDeniedError) {
        log.info(err.message);
      } else {
        log.error('OIDC login failed', err);
      }
      res.redirect(
        `${config.audience}/auth/login?loginError=${LOGIN_CODES.LOGIN_FAILED}`
      );
      return res;
    }
  }

  /**
   * Browser-facing logout for plain links: ends the beabee session and,
   * under OIDC login, the identity provider session (RP-initiated logout)
   */
  @Get('/logout')
  async browserLogout(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    const idToken = req.session.idToken;

    await new Promise<void>((resolve, reject) =>
      req.logout((err) => (err ? reject(err) : resolve()))
    );
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));

    res.redirect(
      isOidcEnabled() ? await getOidcLogoutUrl(idToken) : config.audience
    );
    return res;
  }

  @Get('/info')
  async getAuthInfo(
    @CurrentAuth({ required: false }) auth: AuthInfo
  ): Promise<GetAuthInfoDto> {
    return authTransformer.convert(auth);
  }
}
