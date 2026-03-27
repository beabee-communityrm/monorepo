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

async function importFromStream(
  stream: Readable,
  merge = false
): Promise<void> {
  await dataSource.manager.transaction(async (manager) => {
    const rl = readline.createInterface({
      input: stream,
      output: process.stdout,
      terminal: false,
    });

    let query = '';
    for await (const line of rl) {
      if (query) {
        if (merge && query.startsWith('DELETE FROM')) {
          console.log('Skipping ' + query.substring(0, 100) + ' (merge mode)');
        } else {
          let sql = query;
          if (merge && sql.startsWith('INSERT INTO')) {
            sql = sql.replace(/;\s*$/, ' ON CONFLICT DO NOTHING;');
          }
          console.log('Running ' + sql.substring(0, 100) + '...');
          await manager.query(sql, line !== '' ? JSON.parse(line) : undefined);
        }
        query = '';
      } else {
        query = line;
      }
    }
  });
}

export const importDatabase = async (
  filePath: string | undefined,
  dryRun = false,
  merge = false
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
      await importFromStream(stream, merge);
    } else {
      await importFromStream(process.stdin, merge);
    }
  });
};
