import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueEmailId1773823606137 implements MigrationInterface {
  name = 'UniqueEmailId1773823606137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_flow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL DEFAULT now(), "paymentFlowId" character varying NOT NULL, "loginUrl" character varying NOT NULL, "setPasswordUrl" character varying NOT NULL, "confirmUrl" character varying NOT NULL, "contactId" uuid, "processing" boolean NOT NULL DEFAULT false, "formEmail" character varying NOT NULL, "formMonthlyamount" real NOT NULL, "formPeriod" character varying NOT NULL, "formPayfee" boolean NOT NULL, "formProrate" boolean NOT NULL DEFAULT false, "formPaymentmethod" character varying NOT NULL, "formFirstname" character varying, "formLastname" character varying, "formVatnumber" character varying, "formReferralcode" character varying, "formReferralgift" character varying, "formReferralgiftoptions" jsonb, "formPasswordHash" character varying NOT NULL, "formPasswordSalt" character varying NOT NULL, "formPasswordIterations" integer NOT NULL DEFAULT '1000', "formPasswordTries" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_43ff67f44f7d9ea14edbe0be47d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "UQ_fef3c998a2489b528d8eba1e3ba" UNIQUE ("emailId")`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" ADD CONSTRAINT "FK_0e37a2669cd41392724df0e8b22" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP CONSTRAINT "FK_0e37a2669cd41392724df0e8b22"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "UQ_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`DROP TABLE "payment_flow"`);
  }
}
