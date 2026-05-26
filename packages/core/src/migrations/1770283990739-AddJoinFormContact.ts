import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJoinFormContact1770283990739 implements MigrationInterface {
  name = 'AddJoinFormContact1770283990739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "join_flow" ADD "contactId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "join_flow" ADD CONSTRAINT "UQ_3c92c624858f192bf051c4b8855" UNIQUE ("contactId")`
    );

    await queryRunner.query(
      `ALTER TABLE "join_flow" ADD CONSTRAINT "FK_3c92c624858f192bf051c4b8855" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "join_flow" DROP CONSTRAINT "FK_3c92c624858f192bf051c4b8855"`
    );
    await queryRunner.query(
      `ALTER TABLE "join_flow" DROP CONSTRAINT "UQ_3c92c624858f192bf051c4b8855"`
    );
    await queryRunner.query(`ALTER TABLE "join_flow" DROP COLUMN "contactId"`);
  }
}
