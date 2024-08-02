import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactContributionHistory1722606678117
  implements MigrationInterface
{
  name = "AddContactContributionHistory1722606678117";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD "status" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD "monthlyAmount" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD "period" character varying`
    );
    await queryRunner.query(
      `UPDATE "contact_contribution"
      SET
        "status" = 'current',
        "monthlyAmount" = "contact"."contributionMonthlyAmount",
        "period" = "contact"."contributionPeriod"
      FROM "contact"
      WHERE "contact"."id" = "contact_contribution"."contactId"`
    );
    await queryRunner.query(
      `UPDATE "contact_contribution" SET "method" = 'none' WHERE "method" IS NULL`
    );

    // await queryRunner.query(
    //   `ALTER TABLE "contact_contribution" DROP COLUMN "nextAmount"`
    // );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP CONSTRAINT "PK_a1bac83e58a79755d70afd2a598"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP CONSTRAINT "FK_a973ebea461b08dbf2137cb240e"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD CONSTRAINT "PK_f1a243bb5ecb7d0f234cc02b7be" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ALTER COLUMN "method" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD CONSTRAINT "UQ_ef6b84a4047208e6582cae3eb49" UNIQUE ("contactId", "status")`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD CONSTRAINT "FK_a973ebea461b08dbf2137cb240e" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "contact_contribution" WHERE "status" != 'current'`
    );

    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP CONSTRAINT "FK_a973ebea461b08dbf2137cb240e"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP CONSTRAINT "UQ_ef6b84a4047208e6582cae3eb49"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ALTER COLUMN "method" DROP NOT NULL`
    );
    await queryRunner.query(
      `UPDATE "contact_contribution" SET "method" = NULL WHERE "method" = 'none'`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP CONSTRAINT "PK_f1a243bb5ecb7d0f234cc02b7be"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD CONSTRAINT "FK_a973ebea461b08dbf2137cb240e" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP COLUMN "period"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP COLUMN "monthlyAmount"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP COLUMN "updatedAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP COLUMN "createdAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" ADD CONSTRAINT "PK_a1bac83e58a79755d70afd2a598" PRIMARY KEY ("contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_contribution" DROP COLUMN "id"`
    );
    // await queryRunner.query(
    //   `ALTER TABLE "contact_contribution" ADD "nextAmount" jsonb`
    // );
  }
}
