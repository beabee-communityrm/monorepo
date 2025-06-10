import { MigrationInterface, QueryRunner } from 'typeorm';

import { addThenSetNotNull } from '#utils/db';

export class AddPaymentMethodToJoinForm1650900384747
  implements MigrationInterface
{
  name = 'AddPaymentMethodToJoinForm1650900384747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addThenSetNotNull(
      queryRunner,
      'join_flow',
      'joinFormPaymentmethod',
      'direct-debit'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "join_flow" DROP COLUMN "joinFormPaymentmethod"`
    );
  }
}
