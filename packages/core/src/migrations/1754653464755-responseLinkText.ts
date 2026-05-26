import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResponseLinkText1754653464755 implements MigrationInterface {
  name = 'ResponseLinkText1754653464755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD "responseLinkText" jsonb NOT NULL DEFAULT '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP COLUMN "responseLinkText"`
    );
  }
}
