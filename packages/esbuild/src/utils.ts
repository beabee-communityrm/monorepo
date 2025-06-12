import { mkdirSync } from 'fs';
import { readdir, rename } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

/**
 * Recursively renames .js files to .cjs in a directory
 * Used for CommonJS builds to ensure correct file extensions
 */
export async function renameExtensions(directory: string): Promise<void> {
  for await (const dirEntry of await readdir(directory, {
    withFileTypes: true,
  })) {
    const oldPath = resolve(directory, dirEntry.name);

    if (dirEntry.isDirectory()) {
      await renameExtensions(oldPath);
    } else if (extname(oldPath) === '.js') {
      const newPath = oldPath.replace('.js', '.cjs');
      await rename(oldPath, newPath);
    }
  }
}

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
