import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJoinFlowProcessingFlag1772636569908
  implements MigrationInterface
{
  name = 'AddJoinFlowProcessingFlag1772636569908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "join_flow" ADD "processing" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "join_flow" DROP COLUMN "processing"`);
  }
}
