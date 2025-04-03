import path from "node:path";
import fs from "node:fs/promises";

/**
 * Get content type based on file extension
 * @param filePath Path to file
 * @returns MIME type for the file
 */
export function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

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
      !file.includes("_") &&
      file !== "deletecode" &&
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  return mainImage || null;
}
