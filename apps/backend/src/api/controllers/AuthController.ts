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
import IdpService from '@beabee/core/services/IdpService';
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
  QueryParams,
  Req,
  Res,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import {
  GetAuthInfoDto,
  LoginDto,
  LogoutCallbackDto,
  LogoutResultDto,
  NextOptsDto,
  OidcLoginOptsDto,
} from '#api/dto';
import { authTransformer } from '#api/transformers';
import {
  assertOidcAuthEnabled,
  assertPasswordAuthEnabled,
  clearSiteLoginCookie,
  login,
  setSiteLoginCookie,
} from '#api/utils/auth';

const log = mainLogger.child({ app: 'auth-controller' });

/**
 * Where to send the browser after a login: next was validated on
 * /auth/login, so it is an internal path, which needs the audience, or an
 * absolute URL on a trusted origin
 */
function resolveNext(next = '/'): string {
  return isValidNextUrl(next) ? config.audience + next : next;
}

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
  async logout(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<LogoutResultDto | undefined> {
    const idToken = req.session.idToken;
    await new Promise<void>((resolve, reject) =>
      req.logout((err) => {
        if (err) reject(err);
        else resolve();
      })
    );
    clearSiteLoginCookie(res);

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
   */
  @Get('/login')
  async oidcLogin(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentAuth({ required: false }) auth: AuthInfo,
    @QueryParams() { next, action }: OidcLoginOptsDto
  ): Promise<Response> {
    assertOidcAuthEnabled();
    const contact = auth.contact;
    if (action && !contact) {
      throw new UnauthorizedError();
    }

    try {
      const { url, loginState } = await startOidcLogin(next);
      req.session.oidc = loginState;
      res.redirect(
        action && contact
          ? await IdpService.resolveLoginUrl(url, contact, action)
          : url
      );
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
   * Silent refresh of the website login cookie: one prompt=none round trip at
   * the identity provider. The callback renews the cookie if the IdP session
   * is alive, otherwise clears it, and continues to next either way.
   */
  @Get('/refresh')
  async oidcRefresh(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParams() { next }: NextOptsDto
  ): Promise<Response> {
    assertOidcAuthEnabled();

    try {
      const { url, loginState } = await startOidcLogin(next, true);
      req.session.oidc = loginState;
      res.redirect(url);
    } catch (err) {
      log.error('OIDC refresh failed to start', err);
      clearSiteLoginCookie(res);
      res.redirect(resolveNext(next));
    }
    return res;
  }

  /**
   * OIDC callback: exchanges the authorization code and logs in the contact
   * linked to the identity provider subject. A silent refresh never ends on
   * an error page: any failure clears the website cookie and continues to next.
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
        clearSiteLoginCookie(res);
        // End the IdP session on the way to the error page, otherwise the
        // next login attempt lands on the same error without a login form
        res.redirect(
          loginState.silent
            ? resolveNext(loginState.next)
            : await getOidcLogoutUrl(idToken, {
                postLogoutRedirectUri: `${config.audience}/auth/login?loginError=${LOGIN_CODES.UNLINKED_ACCOUNT}`,
              })
        );
        return res;
      }

      // Regenerates the session, dropping the pre-login state
      await login(req, contact);
      req.session.idToken = idToken;
      if (idToken) {
        setSiteLoginCookie(res, idToken);
      }

      res.redirect(resolveNext(loginState.next));
      return res;
    } catch (err) {
      if (err instanceof OidcLoginDeniedError) {
        log.info(err.message);
      } else {
        log.error('OIDC login failed', err);
      }
      clearSiteLoginCookie(res);
      res.redirect(
        loginState?.silent
          ? resolveNext(loginState.next)
          : `${config.audience}/auth/login?loginError=${LOGIN_CODES.LOGIN_FAILED}`
      );
      return res;
    }
  }

  /**
   * Browser-facing logout for plain links: ends the beabee session and,
   * under OIDC login, the identity provider session (RP-initiated logout).
   * next travels through the IdP as the end-session state and comes back
   * on /auth/logout/callback.
   */
  @Get('/logout')
  async browserLogout(
    @Req() req: Request,
    @Res() res: Response,
    @QueryParams() { next }: NextOptsDto
  ): Promise<Response> {
    const idToken = req.session.idToken;

    await new Promise<void>((resolve, reject) =>
      req.logout((err) => (err ? reject(err) : resolve()))
    );
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));
    clearSiteLoginCookie(res);

    res.redirect(
      isOidcEnabled()
        ? await getOidcLogoutUrl(idToken, { state: next })
        : resolveNext(next)
    );
    return res;
  }

  /**
   * Where the identity provider sends the browser after logout. The state is
   * the next from /auth/logout, validated again since it comes back through
   * the browser.
   */
  @Get('/logout/callback')
  async logoutCallback(
    @Res() res: Response,
    @QueryParams() { state }: LogoutCallbackDto
  ): Promise<Response> {
    res.redirect(resolveNext(state));
    return res;
  }

  @Get('/info')
  async getAuthInfo(
    @CurrentAuth({ required: false }) auth: AuthInfo
  ): Promise<GetAuthInfoDto> {
    return authTransformer.convert(auth);
  }
}
