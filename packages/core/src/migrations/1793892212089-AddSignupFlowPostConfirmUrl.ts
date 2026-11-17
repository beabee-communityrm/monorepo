import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignupFlowPostConfirmUrl1793892212089 implements MigrationInterface {
  name = 'AddSignupFlowPostConfirmUrl1793892212089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ALTER COLUMN "loginUrl" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ALTER COLUMN "setPasswordUrl" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ALTER COLUMN "confirmUrl" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD "postConfirmUrl" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP COLUMN "postConfirmUrl"`
    );
    await queryRunner.query(
      `UPDATE "signup_flow" SET "confirmUrl" = '' WHERE "confirmUrl" IS NULL`
    );
    await queryRunner.query(
      `UPDATE "signup_flow" SET "setPasswordUrl" = '' WHERE "setPasswordUrl" IS NULL`
    );
    await queryRunner.query(
      `UPDATE "signup_flow" SET "loginUrl" = '' WHERE "loginUrl" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ALTER COLUMN "confirmUrl" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ALTER COLUMN "setPasswordUrl" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ALTER COLUMN "loginUrl" SET NOT NULL`
    );
  }
}
