import { RoleType } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import passport from '@beabee/core/lib/passport';

import _pgSession from 'connect-pg-simple';
import express, { RequestHandler, Response } from 'express';
import session from 'express-session';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';

const pgSession = _pgSession(session);

export function setTrackingCookie(memberId: string, res: Response) {
  res.cookie('memberId', memberId, {
    ...config.cookie,
    httpOnly: true,
    maxAge: 365 * 24 * 60 * 60 * 1000,
    sameSite: 'none',
  });
}

export default (app: express.Express): void => {
  app.use(
    session({
      name: config.session,
      secret: config.secret,
      cookie: {
        ...config.cookie,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 267840000,
      },
      saveUninitialized: false,
      store: new pgSession({
        pool: (dataSource.driver as PostgresDriver).master,
      }),
      resave: false,
      rolling: true,
    })
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, res, next) => {
    // User tracking cookie
    const memberId = req.user?.id || req.cookies.memberId;
    if (memberId) {
      setTrackingCookie(memberId, res);
    }

    // User template locals
    res.locals.isLoggedIn = !!req.user;
    res.locals.access = (roleType: RoleType) => req.user?.hasRole(roleType);

    next();
  });
};
