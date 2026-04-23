import { Express } from 'express';

import * as db from '#database';
import { log as mainLogger } from '#logging';
import * as mq from '#message-queue';
import OptionsService from '#services/OptionsService';

const log = mainLogger.child({ app: 'server' });
const PORT = 3000;

export async function initApp() {
  log.info('Initializing app...');
  await db.connect();
  await mq.connect();
  await OptionsService.reload();
}

export function startServer(app: Express) {
  log.info(`Starting server...`);

  app.set('trust proxy', true);

  const server = app.listen(PORT, () => {
    log.info(`Server is ready and listening on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    log.debug('Waiting for server to shutdown');
    server.close();
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
  }
  await db.close();
  await mq.close();
}
