import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeActorTypeNullable1790585189483 implements MigrationInterface {
  name = 'MakeActorTypeNullable1790585189483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_event" ALTER COLUMN "actorType" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_event" ALTER COLUMN "actorType" SET NOT NULL`
    );
  }
}
