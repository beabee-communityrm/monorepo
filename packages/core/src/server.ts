import express, { Express } from 'express';

import config from '#config/config';
import * as db from '#database';
import { log as mainLogger } from '#logging';
import { networkCommunicatorService } from '#services/NetworkCommunicatorService';
import OptionsService from '#services/OptionsService';
import { wrapAsync } from '#utils/express';

const log = mainLogger.child({ app: 'server' });
const PORT = 3000;
const INTERNAL_PORT = 4000;

export async function initApp() {
  log.info('Initializing app...');
  await db.connect();
  await OptionsService.reload();
}

export function startServer(app: Express) {
  log.info(`Starting server...`);

  app.set('trust proxy', true);

  const server = app.listen(PORT, () => {
    log.info(`Server is ready and listening on port ${PORT}`);
  });

  // Internal server, only reachable from other services in the stack
  const internalApp = express();
  internalApp.post(
    '/reload',
    wrapAsync(
      networkCommunicatorService.onInternalServiceRequest.bind(
        networkCommunicatorService
      )
    )
  );
  // The router fetches this in an auth_request subrequest for every frontend
  // page and copies the header into its Content-Security-Policy
  internalApp.get('/trusted-origins', (_, res) => {
    const origins = OptionsService.getList('trusted-origins');
    // Any localhost port in development
    if (config.dev) origins.push('http://localhost:*', 'https://localhost:*');
    res.setHeader('X-Frame-Ancestors', origins.join(' ') || "'none'");
    res.sendStatus(204);
  });
  const internalServer = internalApp.listen(INTERNAL_PORT);

  process.on('SIGTERM', () => {
    log.debug('Waiting for server to shutdown');
    server.close();
    internalServer.close();
    db.close();

    setTimeout(() => {
      log.warning('Server was forced to shutdown after timeout');
      process.exit(1);
    }, 20000).unref();
  });
}

export async function runApp(fn: () => Promise<void>) {
  try {
    await initApp();
    await fn();
  } catch (err) {
    log.error('Uncaught error', err);
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
  await db.close();
}
