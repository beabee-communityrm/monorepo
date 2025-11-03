import { EventEmitter } from 'node:events';
import { createClient } from 'redis';

import config from '#config/config';
import { log as mainLogger } from '#logging';

const log = mainLogger.child({ app: 'message-queue' });

const client = createClient({ url: config.redisUrl });

interface Message {
  event: string;
  timestamp: string;
}

export const events = new EventEmitter();

export async function connect(): Promise<void> {
  await client.connect();
  await client.subscribe('service:broadcast', handleMessage);

  log.info(`Initialized Redis pub/sub`);
}

export async function close(): Promise<void> {
  await client.quit();
}

export async function broadcast(event: string) {
  const message: Message = {
    event,
    timestamp: new Date().toISOString(),
  };

  await client.publish('service:broadcast', JSON.stringify(message));
  log.debug(`Broadcasted event "${event}" to all services`);
}

async function handleMessage(message: string, channel: string): Promise<void> {
  try {
    const { event, timestamp }: Message = JSON.parse(message);

    events.emit(event);
    log.debug(`Received event "${event}" at ${timestamp}`, { channel });
  } catch (error) {
    log.error('Failed to process incoming message', error);
  }
}
