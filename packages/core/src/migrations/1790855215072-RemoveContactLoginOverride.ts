import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContactLoginOverride1790855215072 implements MigrationInterface {
  name = 'RemoveContactLoginOverride1790855215072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact" DROP COLUMN "loginOverride"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contact" ADD "loginOverride" jsonb`);
  }
}
