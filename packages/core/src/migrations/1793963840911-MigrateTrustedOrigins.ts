import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateTrustedOrigins1793963840911 implements MigrationInterface {
  name = 'MigrateTrustedOrigins1793963840911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO "option" (key, value)
      VALUES ('trusted-origins', $1)
      ON CONFLICT (key) DO NOTHING
    `,
      [process.env.BEABEE_TRUSTEDORIGINS || '']
    );
  }

  // Admins may have edited the option since, and the environment variable
  // it came from cannot be restored
  public async down(): Promise<void> {}
}
