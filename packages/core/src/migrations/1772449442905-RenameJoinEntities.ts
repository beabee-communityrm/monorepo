import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameJoinEntities1772449442905 implements MigrationInterface {
  name = 'RenameJoinEntities1772449442905';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "join_flow" RENAME TO "payment_flow"`);
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormEmail" TO "formEmail"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormMonthlyamount" TO "formMonthlyamount"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPeriod" TO "formPeriod"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPayfee" TO "formPayfee"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormProrate" TO "formProrate"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPaymentmethod" TO "formPaymentmethod"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormFirstname" TO "formFirstname"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormLastname" TO "formLastname"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormVatnumber" TO "formVatnumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormReferralcode" TO "formReferralcode"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormReferralgift" TO "formReferralgift"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormReferralgiftoptions" TO "formReferralgiftoptions"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPasswordHash" TO "formPasswordHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPasswordSalt" TO "formPasswordSalt"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPasswordIterations" TO "formPasswordIterations"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" RENAME COLUMN "joinFormPasswordTries" TO "formPasswordTries"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_flow" DROP CONSTRAINT "FK_3c92c624858f192bf051c4b8855"`
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
      `ALTER TABLE "payment_flow" ADD CONSTRAINT "FK_3c92c624858f192bf051c4b8855" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "payment_flow" RENAME TO "join_flow"`);
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formEmail" TO "joinFormEmail"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formMonthlyamount" TO "joinFormMonthlyamount"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPeriod" TO "joinFormPeriod"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPayfee" TO "joinFormPayfee"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formProrate" TO "joinFormProrate"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPaymentmethod" TO "joinFormPaymentmethod"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formFirstname" TO "joinFormFirstname"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formLastname" TO "joinFormLastname"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formVatnumber" TO "joinFormVatnumber"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formReferralcode" TO "joinFormReferralcode"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formReferralgift" TO "joinFormReferralgift"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formReferralgiftoptions" TO "joinFormReferralgiftoptions"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPasswordHash" TO "joinFormPasswordHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPasswordSalt" TO "joinFormPasswordSalt"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPasswordIterations" TO "joinFormPasswordIterations"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" RENAME COLUMN "formPasswordTries" TO "joinFormPasswordTries"`
    );
  }
}
