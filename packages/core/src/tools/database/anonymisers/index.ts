/**
 * Database Anonymization and Export Module
 *
 * This module provides tools for:
 * - Anonymizing database records for safe export
 * - Exporting data to JSON or SQL formats
 * - Importing data from JSON dumps
 * - Managing database dumps with validation
 */

// Export types
export type { DatabaseDump } from './types.js';

// Export utilities
export {
  createDumpFilePath,
  stringify,
  DEFAULT_DUMP_DIRECTORY,
} from './utils.js';

// Export anonymization functions
export { anonymiseModel, exportModelAsIs } from './anonymizer.js';

// Export JSON dump functions
export {
  writeItemsToJsonDump,
  initializeJsonDump,
  validateDumpStructure,
  saveJsonDump,
} from './json-dump.js';

// Export SQL dump functions
export {
  writeItemsToSqlDump,
  initializeSqlDump,
  saveSqlDump,
  clearModels,
} from './sql-dump.js';

// Export importer functions
export { writeJsonToDB } from './importer.js';

// Re-export model-related exports
export {
  ModelAnonymiser,
  ObjectMap,
  PropertyMap,
  calloutResponsesAnonymiser,
  createAnswersAnonymiser,
} from './models.js';
