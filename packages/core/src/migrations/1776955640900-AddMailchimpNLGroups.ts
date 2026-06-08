import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailchimpNLGroups1776955640900 implements MigrationInterface {
  name = 'AddMailchimpNLGroups1776955640900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO option ("key", "value") VALUES ('mailchimp-newsletter-groups',
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
             'id', elem->>'id',
             'label', elem->>'label'
           ))::text
           FROM jsonb_array_elements((SELECT "value" FROM "option" WHERE "key" = 'newsletter-groups')::jsonb) AS elem
           WHERE elem->>'id' IS NOT NULL),
          '[]'
        )
      ) ON CONFLICT DO NOTHING`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM option WHERE "key" = 'mailchimp-newsletter-groups'`
    );
  }
}
