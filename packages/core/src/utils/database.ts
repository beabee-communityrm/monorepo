import { QueryFailedError } from "typeorm";
import type { PgError } from "#types/index";

export function isDuplicateIndex(error: unknown, key?: string): boolean {
  if (error instanceof QueryFailedError) {
    const pgError = error as unknown as PgError;
    const keyTest = key && new RegExp(`^Key \\("?${key}"?\\).* already exists`);
    if (
      pgError.code === "23505" &&
      (!keyTest || keyTest.test(pgError.detail))
    ) {
      return true;
    }
  }
  return false;
}

export function isInvalidType(error: unknown): boolean {
  if (error instanceof QueryFailedError) {
    const pgError = error as unknown as PgError;
    return pgError.code === "22P02";
  }
  return false;
}
