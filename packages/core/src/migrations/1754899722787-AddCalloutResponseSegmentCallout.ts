import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalloutResponseSegmentCallout1754899722787
  implements MigrationInterface
{
  name = 'AddCalloutResponseSegmentCallout1754899722787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "callout_response_segment_callout" ("segmentId" uuid NOT NULL, "calloutId" uuid NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_df97e3e9327335f9157f2fb1456" PRIMARY KEY ("segmentId", "calloutId"))`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_segment_callout" ADD CONSTRAINT "FK_a50070fcdb54259b16ed6270bb2" FOREIGN KEY ("segmentId") REFERENCES "callout_response_segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_segment_callout" ADD CONSTRAINT "FK_2ee55a182d826b8f2d0dd7325fe" FOREIGN KEY ("calloutId") REFERENCES "callout"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "callout_response_segment_callout" DROP CONSTRAINT "FK_2ee55a182d826b8f2d0dd7325fe"`
    );
    await queryRunner.query(
      `ALTER TABLE "callout_response_segment_callout" DROP CONSTRAINT "FK_a50070fcdb54259b16ed6270bb2"`
    );
    await queryRunner.query(`DROP TABLE "callout_response_segment_callout"`);
  }
}
