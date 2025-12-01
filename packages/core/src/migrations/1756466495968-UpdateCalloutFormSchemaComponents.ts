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
      type: string;
      storage?: string;
      provider?: string;
    }[];
  }[];
}

interface SourceCalloutResponseAddressAnswer {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  features?: { text: string; types: [string] }[];
}

interface TargetCalloutResponseAddressAnswer {
  id: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  components: {
    type: string;
    value: string;
  }[];
}

interface CalloutResponse {
  id: string;
  answers: Record<
    string,
    Record<string, SourceCalloutResponseAddressAnswer | undefined>
  >;
}

export class UpdateCalloutFormSchemaComponents1756466495968
  implements MigrationInterface
{
  name = 'UpdateCalloutFormSchemaComponents1756466495968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all callouts with formSchema
    const callouts: Callout[] = await queryRunner.query(
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

      const addressComponents = callout.formSchema.slides.flatMap((s) =>
        s.components
          .filter((c) => c.type === 'address')
          .map((c) => ({ id: c.id, slideId: s.id }))
      );
      if (addressComponents.length > 0) {
        const responses: CalloutResponse[] = await queryRunner.query(
          `SELECT id, answers FROM callout_response WHERE "calloutId" = $1`,
          [callout.id]
        );

        for (const response of responses) {
          const updatedResponse = this.updateResponse(
            response,
            addressComponents
          );
          await queryRunner.query(
            `UPDATE callout_response SET answers = $1 WHERE id = $2`,
            [JSON.stringify(updatedResponse.answers), response.id]
          );
        }
        console.log(
          `  ✅ Updated ${responses.length} callout responses for callout "${callout.id}"`
        );
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

  private updateResponse(
    response: CalloutResponse,
    addressComponents: { slideId: string; id: string }[]
  ): CalloutResponse {
    for (const component of addressComponents) {
      const answer = response.answers[component.slideId][component.id];
      if (answer) {
        const updatedAnswer: TargetCalloutResponseAddressAnswer = {
          id: '', // New field, set to empty string
          formatted_address: answer.formatted_address,
          geometry: answer.geometry,
          components: (answer.features || []).map((feature) => ({
            type: feature.types[0],
            value: feature.text,
          })),
        };
        response.answers[component.slideId][component.id] = updatedAnswer;
      }
    }
    return response;
  }
}
