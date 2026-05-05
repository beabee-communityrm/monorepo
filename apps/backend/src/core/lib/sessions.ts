import config from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import passport from '@beabee/core/lib/passport';

import _pgSession from 'connect-pg-simple';
import type express from 'express';
import session from 'express-session';
import type { Pool } from 'pg';

const pgSession = _pgSession(session);

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
        pool: (dataSource.driver as unknown as { master: Pool }).master,
      }),
      resave: false,
      rolling: true,
    })
  );

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());
};
