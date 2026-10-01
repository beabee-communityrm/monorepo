import type { JobName } from '../data/index.js';

/** database-clean takes no arguments */
export interface DatabaseCleanJobArgs {}

/** The arguments each Job accepts, keyed by job name */
export interface JobArgsMap {
  [JobName.DatabaseClean]: DatabaseCleanJobArgs;
}
