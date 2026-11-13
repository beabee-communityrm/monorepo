import axios, { AxiosError } from 'axios';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import winston from 'winston';
import Transport from 'winston-transport';

import { axiosErrorFormat, truncateForLog } from './log';

const SECRET = 'very-secret-token';

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'invalid', padding: 'x'.repeat(5000) }));
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server.close());

async function getAxiosError(): Promise<AxiosError> {
  try {
    await axios.get(`${baseUrl}/path?key=${SECRET}`, {
      headers: { Authorization: `Bearer ${SECRET}` },
      auth: { username: 'user', password: SECRET },
      data: { apiKey: SECRET },
    });
  } catch (err) {
    if (axios.isAxiosError(err)) return err;
  }
  throw new Error('Expected an axios error');
}

function createLogger(format: winston.Logform.Format) {
  const lines: string[] = [];
  const transport = new Transport({
    log(info: Record<symbol, string>, next: () => void) {
      lines.push(info[Symbol.for('message')]);
      next();
    },
  });
  const logger = winston.createLogger({
    format: winston.format.combine(axiosErrorFormat(), format),
    transports: [transport],
  });
  return { logger, lines };
}

describe('axiosErrorFormat', () => {
  it.each([
    ['json', winston.format.json()],
    ['simple', winston.format.simple()],
  ])('keeps secrets out of %s output', async (_, format) => {
    const error = await getAxiosError();
    const { logger, lines } = createLogger(format);

    logger.error('Uncaught error', error);
    logger.error(error);
    logger.error('Nested', { error });

    expect(lines).toHaveLength(3);
    for (const line of lines) {
      expect(line).not.toContain(SECRET);
      expect(line).toContain(`${baseUrl}/path`);
      expect(line).toContain('401');
      expect(line.length).toBeLessThan(3000);
    }
    expect(error.isAxiosError).toBe(true);
    expect(error.config?.auth?.password).toBe(SECRET);
  });

  it('summarizes an error passed as metadata', async () => {
    const { logger, lines } = createLogger(winston.format.json());

    logger.error('Uncaught error', await getAxiosError());

    expect(JSON.parse(lines[0])).toMatchObject({
      level: 'error',
      message: 'Uncaught error Request failed with status code 401',
      method: 'GET',
      url: `${baseUrl}/path`,
      status: 401,
      code: 'ERR_BAD_REQUEST',
    });
  });

  it('summarizes a nested error', async () => {
    const { logger, lines } = createLogger(winston.format.json());

    logger.error('Nested', { error: await getAxiosError() });

    expect(JSON.parse(lines[0]).error).toMatchObject({
      message: 'Request failed with status code 401',
      method: 'GET',
      url: `${baseUrl}/path`,
      status: 401,
    });
  });

  it('leaves other errors alone', () => {
    const { logger, lines } = createLogger(winston.format.json());

    logger.error('Plain', { error: { reason: 'x' }, extra: 1 });

    expect(JSON.parse(lines[0])).toMatchObject({
      error: { reason: 'x' },
      extra: 1,
    });
  });
});

describe('truncateForLog', () => {
  it('keeps short bodies', () => {
    expect(truncateForLog({ a: 1 })).toBe('{"a":1}');
    expect(truncateForLog('text')).toBe('text');
    expect(truncateForLog(undefined)).toBeUndefined();
  });

  it('cuts long bodies to about 1 KB', () => {
    const result = truncateForLog('x'.repeat(5000));
    expect(result).toHaveLength(1025);
    expect(result?.endsWith('…')).toBe(true);
  });
});
