import { EventEmitter } from 'node:events';
import { createClient } from 'redis';

import config from '#config/config';
import { log as mainLogger } from '#logging';

const log = mainLogger.child({ app: 'message-queue' });

const subClient = createClient({ url: config.messageQueueUrl });
const pubClient = subClient.duplicate();

interface Message {
  event: string;
  timestamp: string;
}

export const events = new EventEmitter();

export async function connect(): Promise<void> {
  await subClient.connect();
  await subClient.subscribe('service:broadcast', handleMessage);

  await pubClient.connect();

  log.info(`Initialized Redis pub/sub connections`);
}

export async function close(): Promise<void> {
  await subClient.quit();
  await pubClient.quit();

  log.info('Closed Redis pub/sub connections');
}

export async function broadcast(event: string) {
  const message: Message = {
    event,
    timestamp: new Date().toISOString(),
  };

  await pubClient.publish('service:broadcast', JSON.stringify(message));
  log.debug(`Broadcasted event "${event}" to all services`);
}

async function handleMessage(message: string, channel: string): Promise<void> {
  try {
    const { event, timestamp }: Message = JSON.parse(message);

    events.emit(event);
    log.info(`Received event "${event}" at ${timestamp}`, { channel });
  } catch (error) {
    log.error('Failed to process incoming message', error);
  }
}
