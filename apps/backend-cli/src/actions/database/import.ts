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
  // In merge mode we run each statement independently (no transaction) so that
  // FK violations (e.g. contactId referencing a contact absent in the local DB)
  // only skip the affected row instead of aborting everything.
  if (merge) {
    let query = '';
    for (const line of lines) {
      if (query) {
        if (query.startsWith('DELETE FROM')) {
          console.log('Skipping ' + query.substring(0, 100) + ' (merge mode)');
        } else {
          const sql = query.startsWith('INSERT INTO')
            ? query.replace(/;\s*$/, ' ON CONFLICT DO NOTHING;')
            : query;
          console.log('Running ' + sql.substring(0, 100) + '...');
          try {
            await dataSource.manager.query(
              sql,
              line !== '' ? JSON.parse(line) : undefined
            );
          } catch (err) {
            console.error(
              'Skipping failed statement:',
              err instanceof Error ? err.message.split('\n')[0] : err
            );
          }
        }
        query = '';
      } else {
        query = line;
      }
    }
    return;
  }

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
