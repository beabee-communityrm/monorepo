import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutResponseSegment1754571145231
  implements MigrationInterface
{
  name = 'AddCalloutResponseSegment1754571145231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "callout_response_segment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "ruleGroup" jsonb NOT NULL, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f9b91c0e735eedc417235f085c8" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "callout_response_segment"`);
  }
}
