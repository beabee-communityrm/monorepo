import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutReviewer1732098141720 implements MigrationInterface {
  name = 'AddCalloutReviewer1732098141720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "callout_reviewer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "calloutId" uuid NOT NULL, "contactId" uuid NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_94bbe28960f36935951caec70e3" UNIQUE ("calloutId", "contactId"), CONSTRAINT "PK_250b70ffd66a275177856e43306" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" ADD CONSTRAINT "FK_ef563e0d0c255e7cb6bc58881dd" FOREIGN KEY ("calloutId") REFERENCES "callout"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" ADD CONSTRAINT "FK_3158d33ab139abac28054db7e0c" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" DROP CONSTRAINT "FK_3158d33ab139abac28054db7e0c"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_reviewer" DROP CONSTRAINT "FK_ef563e0d0c255e7cb6bc58881dd"`
    );
    await queryRunner.query(`DROP TABLE "callout_reviewer"`);
  }
}
