import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveGiftMemberships1788528151186 implements MigrationInterface {
  name = 'RemoveGiftMemberships1788528151186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "member" SET "contributionType"='Manual' WHERE "contributionType"='Gift'`
    );
    await queryRunner.query(
      `UPDATE "segment" SET "ruleGroup"=REPLACE("ruleGroup"::text, '"value": "Gift"', '"value": "Manual"')::jsonb WHERE "ruleGroup"::text LIKE '%"value": "Gift"%'`
    );
    await queryRunner.query(
      `ALTER TABLE "gift_flow" DROP CONSTRAINT "FK_70cda2b5d560765e318bf3995b0"`
    );
    await queryRunner.query(`DROP TABLE "gift_flow"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gift_flow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL DEFAULT now(), "sessionId" character varying NOT NULL, "setupCode" character varying NOT NULL, "completed" boolean NOT NULL DEFAULT false, "processed" boolean NOT NULL DEFAULT false, "gifteeId" uuid, "giftFormFirstname" character varying NOT NULL, "giftFormLastname" character varying NOT NULL, "giftFormEmail" character varying NOT NULL, "giftFormStartdate" date NOT NULL, "giftFormMessage" character varying, "giftFormFromname" character varying NOT NULL, "giftFormFromemail" character varying NOT NULL, "giftFormMonths" integer NOT NULL, "giftFormGiftaddress" jsonb, "giftFormDeliveryaddress" jsonb, CONSTRAINT "UQ_7937ef06d009fce25e5ce4d732c" UNIQUE ("setupCode"), CONSTRAINT "PK_362be23dc8e00b0ea671b3ec982" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "gift_flow" ADD CONSTRAINT "FK_70cda2b5d560765e318bf3995b0" FOREIGN KEY ("gifteeId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
