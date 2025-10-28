/**
 * JSON dump management
 * Handles writing, validation, and saving of JSON database dumps
 */
import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';

import * as fs from 'fs';
import { EntityTarget, ObjectLiteral } from 'typeorm';

import { ModelAnonymiser } from './models.js';
import { DatabaseDump } from './types/database-dump.js';
import { createDumpFilePath } from './utils/dump-file-path.js';

const log = mainLogger.child({ app: 'anonymisers' });

// Global JSON dump object to collect all data during export
let jsonDump: DatabaseDump = {};

// Store outputDir for use in saveJsonDump
let jsonDumpOutputDir: string = '/opt/packages/test-utils/database-dumps';

/**
 * Add items to the in-memory JSON dump
 *
 * @param model The target database model
 * @param items The items to add
 */
function addItemsToJsonDump<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  items: T[]
): void {
  const tableName = getRepository(model).metadata.tableName;

  if (!jsonDump[tableName]) {
    jsonDump[tableName] = [];
  }

  jsonDump[tableName].push(...items);
  log.info(`Added ${items.length} items to ${tableName}`);
}

/**
 * Write items to the JSON dump (wrapper around addItemsToJsonDump)
 *
 * @param model The target database model
 * @param items The items to write for export
 */
export function writeItemsToJsonDump<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  items: T[]
): void {
  addItemsToJsonDump(model, items);
}

/**
 * Initialize the JSON dump by clearing existing data
 *
 * Creates empty arrays for each model's table in the dump structure.
 *
 * @param anonymisers The model anonymizers to initialize tables for
 * @param outputDir Base directory for the dump file (stored for later use in saveJsonDump)
 */
export function initializeJsonDump(
  anonymisers: ModelAnonymiser<ObjectLiteral>[],
  outputDir = '/opt/packages/test-utils/database-dumps'
): void {
  jsonDump = {};
  jsonDumpOutputDir = outputDir;

  // Initialize empty arrays for each table
  for (const anonymiser of anonymisers) {
    const tableName = getRepository(anonymiser.model).metadata.tableName;
    jsonDump[tableName] = [];
    log.info(`Initialized table: ${tableName}`);
  }

  log.info(`JSON dump initialized (output: ${outputDir})`);
}

/**
 * Validate the structure of a database dump
 *
 * Checks that:
 * - Dump is a valid object
 * - All table values are arrays
 * - All records are objects
 *
 * @param dump The dump object to validate
 * @returns true if the structure is valid
 */
export function validateDumpStructure(dump: any): dump is DatabaseDump {
  if (typeof dump !== 'object' || dump === null) {
    return false;
  }

  // Check that all values are arrays
  for (const [tableName, records] of Object.entries(dump)) {
    if (!Array.isArray(records)) {
      log.error(`Table ${tableName} is not an array`);
      return false;
    }

    // Check that records are objects
    for (const record of records) {
      if (typeof record !== 'object' || record === null) {
        log.error(`Invalid record in table ${tableName}`);
        return false;
      }
    }
  }

  return true;
}

/**
 * Save the in-memory JSON dump to a file
 *
 * Creates a timestamped file in the output directory's generated-dumps subfolder.
 * Uses the outputDir that was set during initializeJsonDump.
 *
 * @param dryRun If true, only log what would be done
 */
export async function saveJsonDump(dryRun = false): Promise<void> {
  if (!validateDumpStructure(jsonDump)) {
    throw new Error('Invalid dump structure before saving');
  }

  const jsonString = JSON.stringify(jsonDump, null, 2);
  const filePath = createDumpFilePath(jsonDumpOutputDir, 'json');

  if (!dryRun) {
    await fs.promises.writeFile(filePath, jsonString);
    log.info(`JSON dump saved to: ${filePath}`);
  } else {
    log.info(`[Dry run] JSON dump would be saved to: ${filePath}`);
  }
}
