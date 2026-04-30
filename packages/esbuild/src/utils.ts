import { mkdirSync } from 'fs';

/**
 * Checks if the current process is running in watch mode
 */
export function isWatchMode(): boolean {
  return process.argv.includes('--watch');
}

/**
 * Gets the current timestamp for logging
 */
export function getTimestamp(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Ensures that a directory exists, creating it if necessary
 */
export function ensureDir(dir: string) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}
