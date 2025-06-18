import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutVariantId1750260710855 implements MigrationInterface {
  name = 'AddCalloutVariantId1750260710855';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "PK_e27da2090333df954797676bb02"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "PK_e27da2090333df954797676bb02" PRIMARY KEY ("calloutId", "name", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "FK_0b3fcedbb2f66d24718bbe58d41"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "PK_e27da2090333df954797676bb02"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "PK_e27da2090333df954797676bb02" PRIMARY KEY ("name", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "PK_e27da2090333df954797676bb02"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "PK_2f2ba7c5ffb5b2f8e861da6c5d9" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "UQ_21fb918ad0907913df5c1366071" UNIQUE ("calloutId", "name")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "FK_0b3fcedbb2f66d24718bbe58d41" FOREIGN KEY ("calloutId") REFERENCES "callout"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "FK_0b3fcedbb2f66d24718bbe58d41"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "UQ_21fb918ad0907913df5c1366071"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "PK_2f2ba7c5ffb5b2f8e861da6c5d9"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "PK_e27da2090333df954797676bb02" PRIMARY KEY ("name", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "PK_e27da2090333df954797676bb02"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "PK_e27da2090333df954797676bb02" PRIMARY KEY ("calloutId", "name", "id")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "FK_0b3fcedbb2f66d24718bbe58d41" FOREIGN KEY ("calloutId") REFERENCES "callout"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" DROP CONSTRAINT "PK_e27da2090333df954797676bb02"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_variant" ADD CONSTRAINT "PK_e27da2090333df954797676bb02" PRIMARY KEY ("calloutId", "name")`
    );
    await queryRunner.query(`ALTER TABLE "callout_variant" DROP COLUMN "id"`);
  }
}
