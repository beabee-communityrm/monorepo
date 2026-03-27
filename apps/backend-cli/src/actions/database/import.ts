/**
 * Database Import Module
 *
 * Imports a SQL dump produced by the database export (line pairs: SQL, then params JSON or empty).
 */
import { config } from '@beabee/core/config';
import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

import { createReadStream, readFileSync } from 'node:fs';
import type { Readable } from 'node:stream';

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

async function importFromLines(lines: string[], merge = false): Promise<void> {
  await dataSource.manager.transaction(async (manager) => {
    let query = '';
    for (const line of lines) {
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
      const lines = readFileSync(filePath, 'utf8').split('\n');
      await importFromLines(lines, merge);
    } else {
      const lines = await readLines(process.stdin);
      await importFromLines(lines, merge);
    }
  });
};
