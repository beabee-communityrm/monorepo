// deno-lint-ignore-file no-explicit-any
import { strict as assert } from "assert";

const getEnv = (name: string) => {
  if ((globalThis as any).process?.env) {
    return (globalThis as any).process.env[name];
  }
  // @ts-ignore Node.js doesn't have Deno.env
  if ((Deno as any)?.env?.get) {
    // @ts-ignore Node.js doesn't have Deno.env
    return (Deno as any).env.get(name);
  }
  console.error(
    `Missing environment variable "${name}" or unsupported runtime`,
  );
  return "";
};

export function s(name: string, def?: string): string {
  const value = getEnv(name) || def;
  assert(value !== undefined, `Missing environment variable ${name}`);
  return value;
}

export function ss(name: string, def?: string[]): string[] {
  const value = getEnv(name)?.split(",") || def;
  assert(value !== undefined, `Missing environment variable ${name}`);
  return value;
}

export function n(name: string, def?: number): number {
  const value = Number(getEnv(name)) || def;
  assert(value !== undefined, `Missing environment variable ${name}`);
  assert(
    !isNaN(value!),
    `Invalid number for environment variable ${name}: ${getEnv(name)}`,
  );
  return value!;
}

export function b(name: string, def?: boolean): boolean {
  const value = getEnv(name);
  if (value === undefined && def !== undefined) {
    return def;
  }
  assert(
    value === "true" || value === "false",
    `Invalid boolean for environment variable ${name}: ${value}`,
  );
  return value === "true";
}

export function e<T extends readonly string[]>(
  name: string,
  options: T,
  def?: (typeof options)[number],
): (typeof options)[number] {
  const value = s(name, def);
  assert(
    options.indexOf(value) !== -1,
    `Invalid value for environment variable ${name}: ${value}. Valid options are: ${
      options.join(
        ", ",
      )
    }`,
  );
  return value;
}

export function json(name: string, def?: any): any {
  const value = getEnv(name);
  assert(
    value !== undefined || def !== undefined,
    `Missing environment variable ${name}`,
  );
  return value === undefined ? def : JSON.parse(value);
}
