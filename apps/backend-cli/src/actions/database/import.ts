/**
 * Database Import Module
 *
 * Imports a SQL dump produced by the database export (line pairs: SQL, then params JSON or empty).
 */
import { config } from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

import { createReadStream } from 'node:fs';
import readline from 'node:readline';
import type { Readable } from 'node:stream';

async function importFromStream(stream: Readable): Promise<void> {
  await dataSource.manager.transaction(async (manager) => {
    const rl = readline.createInterface({
      input: stream,
      output: process.stdout,
      terminal: false,
    });

    let query = '';
    for await (const line of rl) {
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
  filePath: string | undefined,
  dryRun = false
): Promise<void> => {
  if (!config.dev) {
    console.error("Can't import to live database");
    process.exit(1);
  }

  if (dryRun) {
    console.log('Dry run: would import from', filePath ?? 'stdin');
    return;
  }

  await runApp(async () => {
    if (filePath) {
      const stream = createReadStream(filePath, 'utf8');
      await importFromStream(stream);
    } else {
      await importFromStream(process.stdin);
    }
  });
};
