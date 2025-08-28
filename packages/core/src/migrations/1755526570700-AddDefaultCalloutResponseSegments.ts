import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultCalloutResponseSegments1755526570700
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO public.callout_response_segment (id, name, "ruleGroup", "order") VALUES ('81664449-adf2-4c3a-aee2-145a96d67726', 'Inbox', '{"rules": [{"field": "bucket", "value": ["inbox"], "operator": "equal"}], "condition": "AND"}', 0)`
    );
    await queryRunner.query(
      `INSERT INTO public.callout_response_segment (id, name,  "ruleGroup", "order") VALUES ('ce1b2919-85c1-4134-8231-df6b860c0ae2', 'Verified',  '{"rules": [{"field": "bucket", "value": ["verified"], "operator": "equal"}], "condition": "AND"}', 1)`
    );
    await queryRunner.query(
      `INSERT INTO public.callout_response_segment (id, name, "ruleGroup", "order") VALUES ('f66f45bd-d406-45f6-87da-34d2cd55297a', 'Trash', '{"rules": [{"field": "bucket", "value": ["trash"], "operator": "equal"}], "condition": "AND"}', 2)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM callout_response_segment WHERE id IN ($1, $2, $3)',
      [
        '81664449-adf2-4c3a-aee2-145a96d67726',
        'ce1b2919-85c1-4134-8231-df6b860c0ae2',
        'f66f45bd-d406-45f6-87da-34d2cd55297a',
      ]
    );
  }
}
