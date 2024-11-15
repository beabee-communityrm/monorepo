import { QueryFailedError, QueryRunner } from "typeorm";

import type { PgError } from "../type";
/**
 * Adds a new column to a table, sets default values, and makes it non-nullable
 * @param queryRunner The TypeORM query runner instance
 * @param table Name of the table to modify
 * @param column Name of the column to add
 * @param def Default value to set for existing rows (defaults to empty string)
 * @example
 * await addThenSetNotNull(queryRunner, 'users', 'username', 'default_user');
 */
export async function addThenSetNotNull(
  queryRunner: QueryRunner,
  table: string,
  column: string,
  def = ""
) {
  await queryRunner.query(
    `ALTER TABLE "${table}" ADD "${column}" character varying`
  );
  await queryRunner.query(`UPDATE "${table}" SET "${column}"=$1`, [def]);
  await queryRunner.query(
    `ALTER TABLE "${table}" ALTER COLUMN "${column}" SET NOT NULL`
  );
}

/**
 * Checks if a database error is due to a duplicate unique index violation
 * @param error The error to check, typically from a database operation
 * @param key Optional field name to check specifically. If provided, checks if this field caused the violation
 * @returns True if the error is a duplicate index error (and matches the key if provided)
 * @example
 * try {
 *   await saveUser();
 * } catch (error) {
 *   if (isDuplicateIndex(error, 'email')) {
 *     // Handle duplicate email error
 *   }
 * }
 */
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

/**
 * Checks if a database error is due to an invalid data type
 * @param error The error to check, typically from a database operation
 * @returns True if the error is an invalid type error (PostgreSQL error code 22P02)
 * @example
 * try {
 *   await saveNumericField();
 * } catch (error) {
 *   if (isInvalidType(error)) {
 *     // Handle invalid type error
 *   }
 * }
 */
export function isInvalidType(error: unknown): boolean {
  if (error instanceof QueryFailedError) {
    const pgError = error as unknown as PgError;
    return pgError.code === "22P02";
  }
  return false;
}
