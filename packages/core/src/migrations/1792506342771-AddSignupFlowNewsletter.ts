import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignupFlowNewsletter1792506342771 implements MigrationInterface {
  name = 'AddSignupFlowNewsletter1792506342771';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD "newsletterStatus" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" ADD "newsletterGroups" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP COLUMN "newsletterGroups"`
    );
    await queryRunner.query(
      `ALTER TABLE "signup_flow" DROP COLUMN "newsletterStatus"`
    );
  }
}
