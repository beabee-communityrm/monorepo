import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeMailchimpNLGroupShape1781270534655 implements MigrationInterface {
  name = 'ChangeMailchimpNLGroupShape1781270534655';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE option
      SET "value" = COALESCE(
        (
          SELECT json_agg(jsonb_build_object('id', id, 'label', ''))::text
          FROM unnest(string_to_array("value", ',')) AS id
          WHERE id != ''
        ),
        '[]'
      )
      WHERE "key" = 'mailchimp-newsletter-groups'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE option
      SET "value" = COALESCE(
        (
          SELECT string_agg(elem->>'id', ',')
          FROM jsonb_array_elements("value"::jsonb) AS elem
          WHERE elem->>'id' != ''
        ),
        ''
      )
      WHERE "key" = 'mailchimp-newsletter-groups'
    `);
  }
}
