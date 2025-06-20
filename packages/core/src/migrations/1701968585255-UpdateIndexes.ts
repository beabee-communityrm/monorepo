import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndexes1701968585255 implements MigrationInterface {
  name = 'UpdateIndexes1701968585255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "FK_5d04ff6c1cd96b3e445cf2a3d32"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "UQ_df2d4c28d0a020a3bffefb15bfe"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ALTER COLUMN "calloutSlug" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" DROP CONSTRAINT "FK_49079a033f285ccfa789aba2efa"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" DROP CONSTRAINT "FK_81b0d2a988cfd8d34ad7fc3bb68"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ALTER COLUMN "contactId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ALTER COLUMN "responseId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP CONSTRAINT "FK_f926258b8d2aa36053b4488d3a3"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP CONSTRAINT "UQ_f926258b8d2aa36053b4488d3a3"`
    );
    await queryRunner.query(
      `ALTER TABLE "export_item" DROP CONSTRAINT "FK_5b7cd3804057bcd15f4ae4a751f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5152e07fe3321acd931df5783"`
    );
    await queryRunner.query(
      `ALTER TABLE "export_item" ALTER COLUMN "exportId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "email_mailing" DROP CONSTRAINT "FK_d84a796de936f37086075c8cc0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "email_mailing" ALTER COLUMN "emailId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" DROP CONSTRAINT "FK_a2c17e82f66eefb33d47feb4b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" DROP CONSTRAINT "UQ_a2c17e82f66eefb33d47feb4b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`
    );
    await queryRunner.query(
      `ALTER TABLE "project" ALTER COLUMN "ownerId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_9010008b8cc4459ff3399935c7a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_324cf3b9fb1cb8ad95c28949b0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "UQ_8f3a11c5ed404fabef99cbbab56"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ALTER COLUMN "projectId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ALTER COLUMN "contactId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_39981c5a5237f7b2003a6d979b4"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_f5bedfe10dbd4e39acff4d714d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_cb736b479149455f456cdc6bd5f"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ALTER COLUMN "projectId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ALTER COLUMN "byContactId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ALTER COLUMN "toContactId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_91b466a38c1ba22e058a405bbc2"`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ALTER COLUMN "refereeId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_security_flow" DROP CONSTRAINT "FK_95804d4501f49efddbdb435a929"`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_security_flow" ALTER COLUMN "contactId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_d9725a78330e4f18d3cd55cdf09"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ALTER COLUMN "segmentId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ALTER COLUMN "emailId" SET NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b5152e07fe3321acd931df5783" ON "export_item" ("exportId", "itemId") `
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "UQ_df2d4c28d0a020a3bffefb15bfe" UNIQUE ("calloutSlug", "number")`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "UQ_8f3a11c5ed404fabef99cbbab56" UNIQUE ("projectId", "contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "FK_5d04ff6c1cd96b3e445cf2a3d32" FOREIGN KEY ("calloutSlug") REFERENCES "callout"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ADD CONSTRAINT "FK_49079a033f285ccfa789aba2efa" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ADD CONSTRAINT "FK_81b0d2a988cfd8d34ad7fc3bb68" FOREIGN KEY ("responseId") REFERENCES "callout_response"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD CONSTRAINT "FK_f926258b8d2aa36053b4488d3a3" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "export_item" ADD CONSTRAINT "FK_5b7cd3804057bcd15f4ae4a751f" FOREIGN KEY ("exportId") REFERENCES "export"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "email_mailing" ADD CONSTRAINT "FK_d84a796de936f37086075c8cc0a" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" ADD CONSTRAINT "FK_a2c17e82f66eefb33d47feb4b55" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_9010008b8cc4459ff3399935c7a" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_324cf3b9fb1cb8ad95c28949b0a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_39981c5a5237f7b2003a6d979b4" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_f5bedfe10dbd4e39acff4d714d3" FOREIGN KEY ("byContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_cb736b479149455f456cdc6bd5f" FOREIGN KEY ("toContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_91b466a38c1ba22e058a405bbc2" FOREIGN KEY ("refereeId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_security_flow" ADD CONSTRAINT "FK_95804d4501f49efddbdb435a929" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_d9725a78330e4f18d3cd55cdf09" FOREIGN KEY ("segmentId") REFERENCES "segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" DROP CONSTRAINT "FK_d9725a78330e4f18d3cd55cdf09"`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_security_flow" DROP CONSTRAINT "FK_95804d4501f49efddbdb435a929"`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_91b466a38c1ba22e058a405bbc2"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_cb736b479149455f456cdc6bd5f"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_f5bedfe10dbd4e39acff4d714d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" DROP CONSTRAINT "FK_39981c5a5237f7b2003a6d979b4"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_324cf3b9fb1cb8ad95c28949b0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "FK_9010008b8cc4459ff3399935c7a"`
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" DROP CONSTRAINT "FK_a2c17e82f66eefb33d47feb4b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "email_mailing" DROP CONSTRAINT "FK_d84a796de936f37086075c8cc0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "export_item" DROP CONSTRAINT "FK_5b7cd3804057bcd15f4ae4a751f"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" DROP CONSTRAINT "FK_f926258b8d2aa36053b4488d3a3"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" DROP CONSTRAINT "FK_81b0d2a988cfd8d34ad7fc3bb68"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" DROP CONSTRAINT "FK_49079a033f285ccfa789aba2efa"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "FK_5d04ff6c1cd96b3e445cf2a3d32"`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" DROP CONSTRAINT "UQ_8f3a11c5ed404fabef99cbbab56"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" DROP CONSTRAINT "UQ_df2d4c28d0a020a3bffefb15bfe"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5152e07fe3321acd931df5783"`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ALTER COLUMN "emailId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ALTER COLUMN "segmentId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_fef3c998a2489b528d8eba1e3ba" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "segment_ongoing_email" ADD CONSTRAINT "FK_d9725a78330e4f18d3cd55cdf09" FOREIGN KEY ("segmentId") REFERENCES "segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_security_flow" ALTER COLUMN "contactId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reset_security_flow" ADD CONSTRAINT "FK_95804d4501f49efddbdb435a929" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ALTER COLUMN "refereeId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_91b466a38c1ba22e058a405bbc2" FOREIGN KEY ("refereeId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ALTER COLUMN "toContactId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ALTER COLUMN "byContactId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ALTER COLUMN "projectId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_cb736b479149455f456cdc6bd5f" FOREIGN KEY ("toContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_f5bedfe10dbd4e39acff4d714d3" FOREIGN KEY ("byContactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_engagement" ADD CONSTRAINT "FK_39981c5a5237f7b2003a6d979b4" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ALTER COLUMN "contactId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ALTER COLUMN "projectId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "UQ_8f3a11c5ed404fabef99cbbab56" UNIQUE ("projectId", "contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_324cf3b9fb1cb8ad95c28949b0a" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project_contact" ADD CONSTRAINT "FK_9010008b8cc4459ff3399935c7a" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "project" ALTER COLUMN "ownerId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" ADD CONSTRAINT "UQ_a2c17e82f66eefb33d47feb4b55" UNIQUE ("contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_data" ADD CONSTRAINT "FK_a2c17e82f66eefb33d47feb4b55" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "email_mailing" ALTER COLUMN "emailId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "email_mailing" ADD CONSTRAINT "FK_d84a796de936f37086075c8cc0a" FOREIGN KEY ("emailId") REFERENCES "email"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "export_item" ALTER COLUMN "exportId" DROP NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b5152e07fe3321acd931df5783" ON "export_item" ("itemId", "exportId") `
    );
    await queryRunner.query(
      `ALTER TABLE "export_item" ADD CONSTRAINT "FK_5b7cd3804057bcd15f4ae4a751f" FOREIGN KEY ("exportId") REFERENCES "export"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD CONSTRAINT "UQ_f926258b8d2aa36053b4488d3a3" UNIQUE ("contactId")`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_profile" ADD CONSTRAINT "FK_f926258b8d2aa36053b4488d3a3" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ALTER COLUMN "responseId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ALTER COLUMN "contactId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ADD CONSTRAINT "FK_81b0d2a988cfd8d34ad7fc3bb68" FOREIGN KEY ("responseId") REFERENCES "callout_response"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_comment" ADD CONSTRAINT "FK_49079a033f285ccfa789aba2efa" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ALTER COLUMN "calloutSlug" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "UQ_df2d4c28d0a020a3bffefb15bfe" UNIQUE ("calloutSlug", "number")`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response" ADD CONSTRAINT "FK_5d04ff6c1cd96b3e445cf2a3d32" FOREIGN KEY ("calloutSlug") REFERENCES "callout"("slug") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
