import chalk from 'chalk';

/**
 * Format file size in human readable format
 * @param bytes File size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
}

/**
 * Format migration success message
 * @param key The S3 key (filename)
 * @param size Size in bytes
 * @returns Formatted success message
 */
export function formatSuccessMessage(key: string, size: number): string {
  return chalk.green(`✓ Migrated: ${key} (${formatFileSize(size)})`);
}

/**
 * Format dry run message
 * @param key The S3 key (filename)
 * @param size Size in bytes
 * @returns Formatted dry run message
 */
export function formatDryRunMessage(key: string, size: number): string {
  return chalk.blue(`Would migrate: ${key} (${formatFileSize(size)})`);
}
