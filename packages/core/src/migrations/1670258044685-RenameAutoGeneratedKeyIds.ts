import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAutoGeneratedKeyIds1670258044685
  implements MigrationInterface
{
  name = 'RenameAutoGeneratedKeyIds1670258044685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "FK_1f9d3a0865ea1e7da7d0ed14ffc"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "FK_29b205fb3a80ff9504564018963"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP CONSTRAINT "FK_434917136b073ff315d700c9f54"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role" DROP CONSTRAINT "FK_d967d4e0dfefc0cad0a355dfcd8"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_89ce346f102c90b97ee97a94d75"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" DROP CONSTRAINT "FK_a1bac83e58a79755d70afd2a598"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_7115f82a61e31ac95b2681d83e4"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_6cc942d4e3bde3e3d22c4304267"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_ef398051d223043e08eb22cf741"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_2f1cee3582cac4576fa7fa2c97f"`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_password_flow" DROP CONSTRAINT "FK_f86d0f751ef1f0fd9efd04910c3"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" DROP CONSTRAINT "FK_1cbab977bf0e854b9290d76b2b3"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" DROP CONSTRAINT "FK_44b23cd35745b0b9c6da7e1840a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "UQ_00377b377c3f444dc856481ae0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" ADD CONSTRAINT "UQ_a2c17e82f66eefb33d47feb4b55" UNIQUE ("contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "UQ_8f3a11c5ed404fabef99cbbab56" UNIQUE ("projectId", "contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "FK_43a6462a28190634780a43e141a" FOREIGN KEY ("pollSlug") REFERENCES "callout"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "FK_ad1be829eb23fe50529a6461c4c" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD CONSTRAINT "FK_f926258b8d2aa36053b4488d3a3" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role" ADD CONSTRAINT "FK_5ccff67a6e15b6e2f4287223759" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_87b8dc2caaf2e8296ff1067ca66" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" ADD CONSTRAINT "FK_a2c17e82f66eefb33d47feb4b55" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_9010008b8cc4459ff3399935c7a" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_324cf3b9fb1cb8ad95c28949b0a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_f5bedfe10dbd4e39acff4d714d3" FOREIGN KEY ("byContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_cb736b479149455f456cdc6bd5f" FOREIGN KEY ("toContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_password_flow" ADD CONSTRAINT "FK_06c9d2d78e460f9a8ecdba5a592" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" ADD CONSTRAINT "FK_c8195732c87b6612b996a4e7376" FOREIGN KEY ("segmentId") REFERENCES "segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" ADD CONSTRAINT "FK_dafaad2c4282eba21a680c28780" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segment_contact" DROP CONSTRAINT "FK_dafaad2c4282eba21a680c28780"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" DROP CONSTRAINT "FK_c8195732c87b6612b996a4e7376"`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_password_flow" DROP CONSTRAINT "FK_06c9d2d78e460f9a8ecdba5a592"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_cb736b479149455f456cdc6bd5f"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_f5bedfe10dbd4e39acff4d714d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_324cf3b9fb1cb8ad95c28949b0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_9010008b8cc4459ff3399935c7a"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" DROP CONSTRAINT "FK_a2c17e82f66eefb33d47feb4b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_87b8dc2caaf2e8296ff1067ca66"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role" DROP CONSTRAINT "FK_5ccff67a6e15b6e2f4287223759"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP CONSTRAINT "FK_f926258b8d2aa36053b4488d3a3"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "FK_ad1be829eb23fe50529a6461c4c"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "FK_43a6462a28190634780a43e141a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "UQ_8f3a11c5ed404fabef99cbbab56"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" DROP CONSTRAINT "UQ_a2c17e82f66eefb33d47feb4b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "UQ_00377b377c3f444dc856481ae0a" UNIQUE ("projectId", "contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" ADD CONSTRAINT "FK_44b23cd35745b0b9c6da7e1840a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_contact" ADD CONSTRAINT "FK_1cbab977bf0e854b9290d76b2b3" FOREIGN KEY ("segmentId") REFERENCES "segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_password_flow" ADD CONSTRAINT "FK_f86d0f751ef1f0fd9efd04910c3" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_2f1cee3582cac4576fa7fa2c97f" FOREIGN KEY ("toContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_ef398051d223043e08eb22cf741" FOREIGN KEY ("byContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_6cc942d4e3bde3e3d22c4304267" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_7115f82a61e31ac95b2681d83e4" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" ADD CONSTRAINT "FK_a1bac83e58a79755d70afd2a598" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_89ce346f102c90b97ee97a94d75" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_role" ADD CONSTRAINT "FK_d967d4e0dfefc0cad0a355dfcd8" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD CONSTRAINT "FK_434917136b073ff315d700c9f54" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "FK_29b205fb3a80ff9504564018963" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "FK_1f9d3a0865ea1e7da7d0ed14ffc" FOREIGN KEY ("pollSlug") REFERENCES "callout"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
