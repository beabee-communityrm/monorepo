import { MigrationInterface, QueryRunner } from "typeorm";

export class FixContactTagAssignment1731076113379
  implements MigrationInterface
{
  name = "FixContactTagAssignment1731076113379";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_5ed4c1702688b750da5e71ba5ad"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_a9fefa4713408da694e358de52a"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "FK_a9fefa4713408da694e358de52a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "FK_5ed4c1702688b750da5e71ba5ad" FOREIGN KEY ("tagId") REFERENCES "contact_tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_5ed4c1702688b750da5e71ba5ad"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" DROP CONSTRAINT "FK_a9fefa4713408da694e358de52a"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "FK_a9fefa4713408da694e358de52a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_tag_assignments" ADD CONSTRAINT "FK_5ed4c1702688b750da5e71ba5ad" FOREIGN KEY ("tagId") REFERENCES "contact_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
