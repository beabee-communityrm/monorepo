import config from '@beabee/core/config';
import {
  completeOidcLogin,
  getOidcLogoutUrl,
  isOidcEnabled,
  startOidcLogin,
} from '@beabee/core/lib/oidc';
import { log as mainLogger } from '@beabee/core/logging';
import ContactsService from '@beabee/core/services/ContactsService';
import { wrapAsync } from '@beabee/core/utils/express';
import { isValidNextUrl } from '@beabee/core/utils/url';

import { Router } from 'express';

import { login } from '#api/utils/auth';

const log = mainLogger.child({ app: 'oidc-auth' });

/**
 * Browser-facing OIDC authentication routes. These are a plain Express router
 * rather than a routing-controllers controller because they respond with
 * redirects and must stay out of the JSON validation/interceptor pipeline.
 */
const router = Router();

// Logout works without OIDC (it just ends the session), login doesn't
router.use(['/login', '/callback'], (req, res, next) => {
  if (isOidcEnabled()) {
    next();
  } else {
    res.redirect(config.audience);
  }
});

router.get(
  '/login',
  wrapAsync(async (req, res) => {
    const next =
      typeof req.query.next === 'string' && isValidNextUrl(req.query.next)
        ? req.query.next
        : undefined;

    const { url, loginState } = await startOidcLogin(next);
    req.session.oidc = loginState;
    res.redirect(url);
  })
);

router.get(
  '/callback',
  wrapAsync(async (req, res) => {
    const loginState = req.session.oidc;
    delete req.session.oidc;

    try {
      if (!loginState) {
        throw new Error('No OIDC login in progress for this session');
      }

      const callbackUrl = new URL(config.oidc.redirectUri);
      callbackUrl.search = new URL(req.originalUrl, config.audience).search;

      const { subject, idToken } = await completeOidcLogin(
        callbackUrl,
        loginState
      );

      const contact = await ContactsService.findOneBy({ idpSubject: subject });
      if (!contact) {
        log.info(`OIDC login for unlinked subject ${subject}`);
        res.redirect(`${config.audience}/auth/login?error=unlinked-account`);
        return;
      }

      // Regenerates the session, dropping the pre-auth state
      await login(req, contact);
      req.session.idToken = idToken;

      const next =
        loginState.next && isValidNextUrl(loginState.next)
          ? loginState.next
          : '/';
      res.redirect(config.audience + next);
    } catch (err) {
      log.error('OIDC login failed', err);
      res.redirect(`${config.audience}/auth/login?error=login-failed`);
    }
  })
);

router.get(
  '/logout',
  wrapAsync(async (req, res) => {
    const idToken = req.session.idToken;

    await new Promise<void>((resolve, reject) =>
      req.logout((err) => (err ? reject(err) : resolve()))
    );
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));

    res.redirect(await getOidcLogoutUrl(idToken));
  })
);

export default router;
