import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMailchimpNLGroups1781533044882 implements MigrationInterface {
  name = 'RemoveMailchimpNLGroups1781533044882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Copy data from options/newsletter-groups to content/join/setup.data.newsletterGroups
    await queryRunner.query(`
      INSERT INTO content (id, updated, data)
      SELECT 'join/setup', NOW(), jsonb_build_object('newsletterGroups', value::jsonb)
      FROM option WHERE key = 'newsletter-groups'
      ON CONFLICT (id) DO UPDATE SET data = content.data || EXCLUDED.data
    `);

    // Empty options/newsletter-groups so it can be used as cache store
    await queryRunner.query(
      `UPDATE option SET value = '[]' WHERE key = 'newsletter-groups'`
    );

    // Delete mailchimp-newsletter-groups column
    await queryRunner.query(
      `DELETE FROM option WHERE key = 'mailchimp-newsletter-groups'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO option (key, value) VALUES ('mailchimp-newsletter-groups', '[]')
      ON CONFLICT DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE option SET value = COALESCE(
        (SELECT (data->'newsletterGroups')::text FROM content WHERE id = 'join/setup'),
        '[]'
      ) WHERE key = 'newsletter-groups'
    `);
  }
}
