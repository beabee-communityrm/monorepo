import { MigrationInterface, QueryRunner } from 'typeorm';

interface Callout {
  id: string;
  formSchema: CalloutFormSchema;
  slug: string;
}

interface CalloutFormSchema {
  slides: {
    id: string;
    components: {
      id: string;
      key: string;
      type: string;
      storage?: string;
      provider?: string;
    }[];
  }[];
}

export class UpdateCalloutFormSchemaComponents1756466495968 implements MigrationInterface {
  name = 'UpdateCalloutFormSchemaComponents1756466495968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all callouts with formSchema
    const callouts: Callout[] = await queryRunner.query(
      `SELECT id, "formSchema", "slug" FROM callout WHERE "formSchema" IS NOT NULL`
    );

    console.log(`📊 Found ${callouts.length} callouts with formSchema`);

    for (const callout of callouts) {
      // queryRunner.query() may return JSONB columns as raw strings
      if (typeof callout.formSchema === 'string') {
        callout.formSchema = JSON.parse(callout.formSchema);
      }
      const updatedFormSchema = this.updateFormSchema(callout.formSchema);

      await queryRunner.query(
        `UPDATE callout SET "formSchema" = $1 WHERE id = $2`,
        [JSON.stringify(updatedFormSchema), callout.id]
      );
      console.log(`✅ Updated callout "${callout.id}" (${callout.slug})`);

      const addressComponents = callout.formSchema.slides.flatMap((s) =>
        s.components
          .filter((c) => c.type === 'address')
          .map((c) => ({ key: c.key, slideId: s.id }))
      );
      if (addressComponents.length > 0) {
        for (const { slideId, key } of addressComponents) {
          // Use native JSONB SQL to transform answers in-database rather than
          // fetching/mutating/writing in JS (TypeORM queryRunner JSONB results
          // are not reliably mutable after deserialization).
          await queryRunner.query(
            `UPDATE callout_response
             SET answers = jsonb_set(
               answers,
               '{${slideId},${key}}',
               jsonb_build_object(
                 'id', '',
                 'formatted_address', answers->'${slideId}'->'${key}'->>'formatted_address',
                 'geometry',          answers->'${slideId}'->'${key}'->'geometry',
                 'components', COALESCE(
                   (SELECT jsonb_agg(
                      jsonb_build_object(
                        'type', feat->'types'->0,
                        'value', feat->>'text'
                      )
                    )
                    FROM jsonb_array_elements(
                      answers->'${slideId}'->'${key}'->'features'
                    ) AS feat),
                   '[]'::jsonb
                 ),
                 'source', 'maptiler'
               )
             )
             WHERE "calloutId" = $1
               AND answers->'${slideId}'->'${key}' ? 'geometry'`,
            [callout.id]
          );
          console.log(
            `  ✅ Updated responses for "${slideId}.${key}" in "${callout.slug}"`
          );
        }
      }
    }

    console.log('✅ Migration completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No down migration
  }

  /**
   * Recursively updates form schema components
   * - Sets storage: "beabee" for all file components
   * - Sets provider: "maptiler" for all address components
   */
  private updateFormSchema(schema: CalloutFormSchema): CalloutFormSchema {
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
