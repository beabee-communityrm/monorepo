import { strict as assert } from "assert";

/**
 * Reads an environment variable as a string
 * @param name The name of the environment variable to read
 * @param def The default value to return if the environment variable is not set
 * @returns The value
 */
export function s(name: string, def?: string): string {
  const value = process.env[name] || def;
  assert(value !== undefined, `Missing environment variable ${name}`);
  return value;
}

/**
 * Reads an environment variable as a string array
 * @param name The name of the environment variable to read
 * @param def The default value to return if the environment variable is not set
 * @returns The value
 */
export function ss(name: string, def?: string[]): string[] {
  const value = process.env[name]?.split(",") || def;
  assert(value !== undefined, `Missing environment variable ${name}`);
  return value;
}

/**
 * Reads an environment variable as a number
 * @param name The name of the environment variable to read
 * @param def The default value to return if the environment variable is not set
 * @returns The value
 */
export function n(name: string, def?: number): number {
  const value = Number(process.env[name]) || def;
  assert(value !== undefined, `Missing environment variable ${name}`);
  assert(
    !isNaN(value),
    `Invalid number for environment variable ${name}: ${process.env[name]}`
  );
  return value;
}

/**
 * Reads an environment variable as a boolean
 * @param name The name of the environment variable to read
 * @param def The default value to return if the environment variable is not set
 * @returns The value
 */
export function b(name: string, def?: boolean): boolean {
  const value = process.env[name];
  if (value === undefined && def !== undefined) {
    return def;
  }
  assert(
    value === "true" || value === "false",
    `Invalid boolean for environment variable ${name}: ${value}`
  );
  return value === "true";
}

/**
 * Reads an environment variable as a string and checks if it is one of the allowed options
 * @param name The name of the environment variable to read
 * @param options The allowed options
 * @param def The default value to return if the environment variable is not set
 * @returns The value
 */
export function e<T extends readonly string[]>(
  name: string,
  options: T,
  def?: (typeof options)[number]
): (typeof options)[number] {
  const value = s(name, def);
  assert(
    options.indexOf(value) !== -1,
    `Invalid value for environment variable ${name}: ${value}. Valid options are: ${options.join(
      ", "
    )}`
  );
  return value;
}

/**
 * Reads an environment variable as a JSON object
 * @param name The name of the environment variable to read
 * @param def The default value to return if the environment variable is not set
 * @returns The value
 */
export function json(name: string, def?: any): any {
  const value = process.env[name];
  assert(
    value !== undefined || def !== undefined,
    `Missing environment variable ${name}`
  );
  return value === undefined ? def : JSON.parse(value);
}
