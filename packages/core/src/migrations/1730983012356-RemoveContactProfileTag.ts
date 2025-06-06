import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContactProfileTag1730983012356
  implements MigrationInterface
{
  name = 'RemoveContactProfileTag1730983012356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove old tags column from contact_profile
    await queryRunner.query(`ALTER TABLE "contact_profile" DROP COLUMN "tags"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the old tags column
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD "tags" jsonb NOT NULL DEFAULT '[]'`
    );
  }
}
