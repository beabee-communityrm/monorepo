/**
 * Database Import Module
 *
 * Imports a SQL dump produced by the database export (line pairs: SQL, then params JSON or empty).
 */
import { config } from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

import type { Readable } from 'node:stream';

import type { ImportDatabaseArgs } from '../../types/index.js';

/**
 * Read all lines from a stream without readline's internal line length limit.
 * Node.js readline can silently split lines longer than ~1.8MB.
 */
async function readLines(stream: Readable): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8').split('\n');
}

async function importFromLines(lines: string[]): Promise<void> {
  await dataSource.manager.transaction(async (manager) => {
    let query = '';
    for (const line of lines) {
      if (query) {
        console.log('Running ' + query.substring(0, 100) + '...');
        await manager.query(query, line !== '' ? JSON.parse(line) : undefined);
        query = '';
      } else {
        query = line;
      }
    }
  });
}

export const importDatabase = async (
  args: ImportDatabaseArgs
): Promise<void> => {
  if (!config.dev) {
    console.error("Can't import to live database");
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('Dry run: would import from stdin');
    return;
  }

  await runApp(async () => {
    const lines = await readLines(process.stdin);
    await importFromLines(lines);
  });
};
