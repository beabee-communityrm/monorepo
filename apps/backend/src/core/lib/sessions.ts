import _pgSession from "connect-pg-simple";
import express, { RequestHandler } from "express";
import session from "express-session";
import { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";

import { dataSource } from "@beabee/core/database";
import passport from "@beabee/core/lib/passport";

import config from "@beabee/core/config";

const pgSession = _pgSession(session);

export default (app: express.Express): void => {
  app.use(
    session({
      name: config.session,
      secret: config.secret,
      cookie: {
        ...config.cookie,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 267840000
      },
      saveUninitialized: false,
      store: new pgSession({
        pool: (dataSource.driver as PostgresDriver).master
      }),
      resave: false,
      rolling: true
    }) as unknown as RequestHandler // TODO: Fix this
  );

  // Passport
  app.use(passport.initialize() as unknown as RequestHandler); // TODO: Fix this
  app.use(passport.session());
};
