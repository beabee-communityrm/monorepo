import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutResponseSegment1755526570609
  implements MigrationInterface
{
  name = 'AddCalloutResponseSegment1755526570609';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "callout_response_segment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "ruleGroup" jsonb NOT NULL, "isGlobal" boolean NOT NULL DEFAULT 'false', "calloutId" uuid, "order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f9b91c0e735eedc417235f085c8" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_segment" ADD CONSTRAINT "FK_4d8a9f6f61a63fea1dda6b7081c" FOREIGN KEY ("calloutId") REFERENCES "callout"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response_segment" DROP CONSTRAINT "FK_4d8a9f6f61a63fea1dda6b7081c"`
    );
    await queryRunner.query(`DROP TABLE "callout_response_segment"`);
  }
}
