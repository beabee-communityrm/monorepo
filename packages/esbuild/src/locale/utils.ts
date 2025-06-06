import { readFile, writeFile } from "node:fs/promises";

/**
 * Read and parse a JSON file
 * @param filePath Path to the JSON file
 * @returns Parsed JSON content
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as T;
}

/**
 * Write data to a JSON file
 * @param filePath Path where to write the file
 * @param data Data to write
 */
export async function writeJsonFile(
  filePath: string,
  data: Record<string, any>
): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Process an object recursively, applying a transformation function to string values
 * @param obj The object to process
 * @param transformFn Function to transform string values
 * @returns A new object with transformed values
 */
export function processObjectStrings(
  obj: Record<string, any>,
  transformFn: (value: string) => string
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object") {
      result[key] = processObjectStrings(value, transformFn);
    } else if (typeof value === "string") {
      result[key] = transformFn(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Recursively merges two objects, using a function to handle string values
 * @param target The target object to be updated
 * @param source The source object containing the complete structure
 * @param stringHandler Function to handle string values when merging
 * @returns The merged object
 */
export function mergeObjects(
  target: Record<string, any>,
  source: Record<string, any>,
  stringHandler: (
    targetValue: string | undefined,
    sourceValue: string
  ) => string
): Record<string, any> {
  const result = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    // Handle non-existent keys
    if (!(key in result)) {
      if (sourceValue !== null && typeof sourceValue === "object") {
        result[key] = {};
      } else if (typeof sourceValue === "string") {
        result[key] = stringHandler(undefined, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
    // Handle existing keys
    else {
      const targetValue = result[key];

      // For objects, merge recursively
      if (
        sourceValue !== null &&
        typeof sourceValue === "object" &&
        targetValue !== null &&
        typeof targetValue === "object"
      ) {
        result[key] = mergeObjects(targetValue, sourceValue, stringHandler);
      }
      // For strings, use the string handler
      else if (
        typeof sourceValue === "string" &&
        typeof targetValue === "string"
      ) {
        result[key] = stringHandler(targetValue, sourceValue);
      }
      // For other types, keep the target value
    }
  }

  return result;
}

/**
 * Error handler for async operations
 * @param error The error to handle
 * @param context Additional context about where the error occurred
 */
export function handleError(error: unknown, context: string): never {
  console.error(`Error ${context}:`, error);
  throw error;
}
