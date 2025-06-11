import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Recursively get all files in a directory
 * @param dir Directory to scan
 * @returns List of file paths
 */
export async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? await getAllFiles(fullPath) : fullPath;
    })
  );

  return files.flat();
}

/**
 * Find image directories in the source folder
 * @param sourcePath Source directory path
 * @returns List of directory names
 */
export async function findImageDirectories(
  sourcePath: string
): Promise<string[]> {
  const entries = await fs.readdir(sourcePath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/**
 * Find the main image file in a directory
 * @param dirPath Directory path
 * @returns Name of the main image file or null if not found
 */
export async function findMainImage(dirPath: string): Promise<string | null> {
  const files = await fs.readdir(dirPath);

  const mainImage = files.find(
    (file) =>
      !file.includes('_') &&
      file !== 'deletecode' &&
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  return mainImage || null;
}
