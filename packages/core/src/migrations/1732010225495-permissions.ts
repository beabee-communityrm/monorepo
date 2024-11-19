import { MigrationInterface, QueryRunner } from "typeorm";

export class Permissions1732010225495 implements MigrationInterface {
  name = "Permissions1732010225495";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contact_role_permissions" ("roleId" character varying NOT NULL, "permissionId" uuid NOT NULL, "dateAssigned" TIMESTAMP NOT NULL DEFAULT now(), "roleContactId" uuid, "roleType" character varying, CONSTRAINT "PK_a3375c000eeb1dc82b62d5cf57c" PRIMARY KEY ("roleId", "permissionId"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a3375c000eeb1dc82b62d5cf57" ON "contact_role_permissions" ("roleId", "permissionId") `
    );
    await queryRunner.query(
      `CREATE TABLE "permission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "description" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_20ff45fefbd3a7c04d2572c3bbd" UNIQUE ("key"), CONSTRAINT "PK_3b8b97af9d9d8807e41e6f48362" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role_permissions" ADD CONSTRAINT "FK_9da50b910f487f6a67fe4b9bf8e" FOREIGN KEY ("roleContactId", "roleType") REFERENCES "contact_role"("contactId","type") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role_permissions" ADD CONSTRAINT "FK_85705685abcb01b1d9ebd9a69a5" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_role_permissions" DROP CONSTRAINT "FK_85705685abcb01b1d9ebd9a69a5"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role_permissions" DROP CONSTRAINT "FK_9da50b910f487f6a67fe4b9bf8e"`
    );
    await queryRunner.query(`DROP TABLE "permission"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3375c000eeb1dc82b62d5cf57"`
    );
    await queryRunner.query(`DROP TABLE "contact_role_permissions"`);
  }
}
