import { CalloutResponseAnswersSlide } from '@beabee/beabee-common';
import { ApiKey, Contact } from '@beabee/core/models';
import { AuthInfo as AuthInfo2, OidcLoginState } from '@beabee/core/type';

import { ParamsDictionary } from 'express-serve-static-core';

declare global {
  type HTMLElement = never;
  type BufferSource = never;
  type FormData = never;
  type URLSearchParams = never;

  namespace Express {
    export interface User extends Contact {}

    export interface Request {
      auth: AuthInfo2;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    method?: 'plain' | 'totp';
    answers: CalloutResponseAnswersSlide | undefined;
    /** OIDC login in progress, between redirect and callback */
    oidc?: OidcLoginState;
    /** ID token of the current OIDC login, used as logout hint */
    idToken?: string | undefined;
    /** Sealed refresh token of the current OIDC login, renews the website login cookie */
    refreshToken?: string | undefined;
    /** When the member last authenticated at the IdP, seconds since the epoch */
    authTime?: number | undefined;
    /** One `directLogin` beabee allows for this contact, until expiresAt (seconds since the epoch) */
    loginGrant?: { contactId: string; expiresAt: number } | undefined;
  }
}
