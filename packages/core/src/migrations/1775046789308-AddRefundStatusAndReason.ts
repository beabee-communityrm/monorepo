import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundStatusAndReason1775046789308
  implements MigrationInterface
{
  name = 'AddRefundStatusAndReason1775046789308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "refundStatus" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "refundReason" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "refundStatus"`);
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "refundReason"`);
  }
}
