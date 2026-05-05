import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignupFlow1772461466485 implements MigrationInterface {
  name = 'AddSignupFlow1772461466485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP CONSTRAINT "FK_0e37a2669cd41392724df0e8b22"`
    );
    await queryRunner.query(
      `CREATE TABLE "signup_flow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "loginUrl" character varying NOT NULL, "setPasswordUrl" character varying NOT NULL, "confirmUrl" character varying NOT NULL, "paymentFlowId" uuid, "contactId" uuid, "passwordHash" character varying NOT NULL, "passwordSalt" character varying NOT NULL, "passwordIterations" integer NOT NULL DEFAULT '1000', "passwordTries" integer NOT NULL DEFAULT '0', "processing" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_6153d3160f5f810ad8ad3aecb8" UNIQUE ("paymentFlowId"), CONSTRAINT "PK_12fe06cd273880ec41635acd5f0" PRIMARY KEY ("id"))`
    );

    // Move data from payment_flow to signup_flow
    await queryRunner.query(
      `INSERT INTO "signup_flow" ("date", "email", "loginUrl", "setPasswordUrl", "confirmUrl", "paymentFlowId", "contactId", "passwordHash", "passwordSalt", "passwordIterations", "passwordTries")
      SELECT "date", "formEmail", "loginUrl", "setPasswordUrl", "confirmUrl", id, "contactId", "formPasswordHash", "formPasswordSalt", "formPasswordIterations", "formPasswordTries" FROM "payment_flow"`
    );

    // Remove columns from payment_flow
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formReferralgiftoptions"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPasswordIterations"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPasswordTries"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "contactId"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formReferralcode"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formReferralgift"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formEmail"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPasswordHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "formPasswordSalt"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "loginUrl"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "setPasswordUrl"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP COLUMN "confirmUrl"`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD CONSTRAINT "FK_6153d3160f5f810ad8ad3aecb8c" FOREIGN KEY ("paymentFlowId") REFERENCES "payment_flow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD CONSTRAINT "FK_f9d8f73b4c7384218e9bf45a999" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP CONSTRAINT "FK_f9d8f73b4c7384218e9bf45a999"`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP CONSTRAINT "FK_6153d3160f5f810ad8ad3aecb8c"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "confirmUrl" character varying NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "setPasswordUrl" character varying NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "loginUrl" character varying NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPasswordSalt" character varying NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPasswordHash" character varying NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formEmail" character varying NOT NULL DEFAULT ''`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formReferralgift" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formReferralcode" character varying`
    );
    await queryRunner.query(`ALTER TABLE "payment_flow" ADD "contactId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPasswordTries" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formPasswordIterations" integer NOT NULL DEFAULT '1000'`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD "formReferralgiftoptions" jsonb`
    );

    // Move data back from signup_flow to payment_flow
    await queryRunner.query(
      `UPDATE "payment_flow" pf SET
        "formEmail" = sf."email",
        "loginUrl" = sf."loginUrl",
        "setPasswordUrl" = sf."setPasswordUrl",
        "confirmUrl" = sf."confirmUrl",
        "contactId" = sf."contactId",
        "formPasswordHash" = sf."passwordHash",
        "formPasswordSalt" = sf."passwordSalt",
        "formPasswordIterations" = sf."passwordIterations",
        "formPasswordTries" = sf."passwordTries"
      FROM "signup_flow" sf
      WHERE pf.id = sf."paymentFlowId"`
    );

    // Remove default values after updating data
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "confirmUrl" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "setPasswordUrl" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "loginUrl" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formPasswordSalt" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formPasswordHash" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ALTER COLUMN "formEmail" DROP DEFAULT`
    );

    await queryRunner.query(`DROP TABLE "signup_flow"`);
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD CONSTRAINT "FK_0e37a2669cd41392724df0e8b22" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
