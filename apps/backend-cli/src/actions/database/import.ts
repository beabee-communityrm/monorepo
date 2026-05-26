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

// PostgreSQL FK violation error code
const PG_FK_VIOLATION = '23503';

// Columns that reference other tables and can safely be nulled on FK violation
const NULLABLE_FK_COLUMNS = ['contactId', 'assigneeId'];

/**
 * On FK violation, null out FK columns in the params array and retry.
 * Returns the modified params, or null if no FK columns were found.
 */
function nullifyFkParams(sql: string, params: unknown[]): unknown[] | null {
  const colMatch = sql.match(/INSERT INTO "[^"]+"\(([^)]+)\)/);
  if (!colMatch) return null;

  const cols = colMatch[1].split(',').map((c) => c.trim().replace(/"/g, ''));
  const fkIndices = cols
    .map((col, i) => (NULLABLE_FK_COLUMNS.includes(col) ? i : -1))
    .filter((i) => i >= 0);
  if (fkIndices.length === 0) return null;

  const newParams = [...params];
  const rowCount = params.length / cols.length;
  for (let row = 0; row < rowCount; row++) {
    for (const colIdx of fkIndices) {
      newParams[row * cols.length + colIdx] = null;
    }
  }
  return newParams;
}

async function importFromLines(lines: string[], merge = false): Promise<void> {
  // In merge mode we run each statement independently (no transaction) so that
  // FK violations (e.g. contactId referencing a contact absent in the local DB)
  // only affect the failing row instead of aborting everything.
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
          const params =
            line !== '' ? (JSON.parse(line) as unknown[]) : undefined;
          console.log('Running ' + sql.substring(0, 100) + '...');
          try {
            await dataSource.manager.query(sql, params);
          } catch (err) {
            const code = (err as { code?: string }).code;
            if (code === PG_FK_VIOLATION && params) {
              const nullified = nullifyFkParams(sql, params);
              if (nullified) {
                console.error(
                  'Warning: FK violation — retrying with contact fields nulled:',
                  err instanceof Error ? err.message.split('\n')[0] : err
                );
                await dataSource.manager.query(sql, nullified);
              } else {
                console.error(
                  'Skipping failed statement:',
                  err instanceof Error ? err.message.split('\n')[0] : err
                );
              }
            } else {
              console.error(
                'Skipping failed statement:',
                err instanceof Error ? err.message.split('\n')[0] : err
              );
            }
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
