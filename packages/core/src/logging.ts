import type { ErrorRequestHandler } from 'express';
import expressWinston from 'express-winston';
import winston from 'winston';

import config from './config/config.js';
import { axiosErrorFormat } from './utils/log.js';

const appFormat = winston.format((info) => {
  const { app, ...rest } = info;
  return app ? { ...rest, message: `[${app}] ${rest.message}` } : info;
});

const logFormats = {
  json: winston.format.json(),
  simple: winston.format.combine(
    winston.format.colorize(),
    appFormat(),
    winston.format.simple()
  ),
} as const;

const logger = winston.createLogger({
  format: winston.format.combine(
    axiosErrorFormat(),
    logFormats[config.logFormat]
  ),
  levels: winston.config.syslog.levels,
  defaultMeta: config.logFields,
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error', 'warning', 'info', 'debug'],
    }),
  ],
});

export const log = logger;

export const createRequestLogger = (app: string) =>
  expressWinston.logger({
    winstonInstance: logger.child({ app }),
    msg: '{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    requestFilter: (req, propName) => {
      if (propName === 'headers') {
        const { cookie, ...rest } = req.headers;
        return rest;
      } else {
        return req[propName];
      }
    },
  });

export const requestLogger = createRequestLogger('request');

export const requestErrorLogger: ErrorRequestHandler =
  expressWinston.errorLogger({
    winstonInstance: logger.child({ app: 'request-error' }),
  });
