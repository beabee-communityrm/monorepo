import type {
  CalloutComponentSchema,
  SetCalloutFormSchema,
} from '@beabee/beabee-common';

import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCalloutFormSchemaComponents1756466495968
  implements MigrationInterface
{
  name = 'UpdateCalloutFormSchemaComponents1756466495968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all callouts with formSchema
    const callouts: {
      id: string;
      formSchema: SetCalloutFormSchema;
      slug: string;
    }[] = await queryRunner.query(
      `SELECT id, "formSchema", "slug" FROM callout WHERE "formSchema" IS NOT NULL`
    );

    console.log(`📊 Found ${callouts.length} callouts with formSchema`);

    for (const callout of callouts) {
      const updatedFormSchema = this.updateFormSchema(callout.formSchema);

      await queryRunner.query(
        `UPDATE callout SET "formSchema" = $1 WHERE id = $2`,
        [JSON.stringify(updatedFormSchema), callout.id]
      );
      console.log(`✅ Updated callout "${callout.id}" (${callout.slug})`);
    }

    console.log('✅ Migration completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No down migration needed
  }

  /**
   * Recursively updates form schema components
   * - Sets storage: "beabee" for all file components
   * - Sets provider: "maptiler" for all address components
   */
  private updateFormSchema(schema: SetCalloutFormSchema): SetCalloutFormSchema {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    for (const slide of schema.slides) {
      for (const component of slide.components) {
        if (component.type === 'file' && component.storage !== 'beabee') {
          console.log(
            `    - Updating file component "${component.id}" in slide "${slide.id}" from "${component.storage}" to "beabee"`
          );
          component.storage = 'beabee';
        }
        if (component.type === 'address' && component.provider !== 'maptiler') {
          console.log(
            `    - Updating address component "${component.id}" in slide "${slide.id}" from "${component.provider}" to "maptiler"`
          );
          component.provider = 'maptiler';
        }
      }
    }

    return schema;
  }
}
