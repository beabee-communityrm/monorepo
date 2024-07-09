import { QueryFailedError, QueryRunner } from "typeorm";

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

interface PgError {
  code: string;
  detail: string;
}

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
