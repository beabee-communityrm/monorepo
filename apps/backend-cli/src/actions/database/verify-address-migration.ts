/**
 * One-off verification script for PR #323 (feat/formio-address-provider).
 *
 * Run AFTER switching to the feature branch and restarting Docker so the
 * TypeORM migration has executed. Checks that all callout response address
 * answers were converted from the old FormIO format to the new Maptiler
 * format, and that coordinates are preserved.
 */
import { dataSource } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

interface FormSchemaComponent {
  id: string;
  type: string;
  storage?: string;
  provider?: string;
}

interface FormSchemaSlide {
  id: string;
  components: FormSchemaComponent[];
}

interface CalloutRow {
  id: string;
  slug: string;
  formSchema: { slides: FormSchemaSlide[] };
}

interface ResponseRow {
  id: string;
  answers: Record<string, Record<string, unknown>>;
}

interface AddressAnswer {
  id?: unknown;
  source?: unknown;
  formatted_address?: unknown;
  geometry?: { location?: { lat?: unknown; lng?: unknown } };
  components?: unknown[];
  features?: unknown[];
}

interface CalloutResult {
  slug: string;
  schemaIssues: string[];
  totalResponses: number;
  totalAddressAnswers: number;
  failures: string[];
  warnings: string[];
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

function checkAddressAnswer(
  answer: AddressAnswer,
  label: string,
  result: CalloutResult
): void {
  result.totalAddressAnswers++;

  if (answer.features !== undefined) {
    result.failures.push(
      `${label}: old "features" field still present — migration did not run`
    );
  }
  if (!('id' in answer)) {
    result.failures.push(`${label}: missing "id" field`);
  }
  if (!('components' in answer)) {
    result.failures.push(`${label}: missing "components" field`);
  }
  if (
    !answer.formatted_address ||
    typeof answer.formatted_address !== 'string'
  ) {
    result.failures.push(`${label}: "formatted_address" is empty or missing`);
  }

  const lat = answer.geometry?.location?.lat;
  const lng = answer.geometry?.location?.lng;
  if (typeof lat !== 'number' || !isFinite(lat)) {
    result.failures.push(
      `${label}: lat is not a finite number (got ${JSON.stringify(lat)})`
    );
  }
  if (typeof lng !== 'number' || !isFinite(lng)) {
    result.failures.push(
      `${label}: lng is not a finite number (got ${JSON.stringify(lng)})`
    );
  }

  if (!answer.source) {
    result.warnings.push(`${label}: "source" field missing`);
  }
  if (Array.isArray(answer.components) && answer.components.length === 0) {
    result.warnings.push(
      `${label}: "components" is empty — address formatting will produce blank strings`
    );
  }

  if (typeof lat === 'number' && isFinite(lat)) {
    if (lat < result.latMin) result.latMin = lat;
    if (lat > result.latMax) result.latMax = lat;
  }
  if (typeof lng === 'number' && isFinite(lng)) {
    if (lng < result.lngMin) result.lngMin = lng;
    if (lng > result.lngMax) result.lngMax = lng;
  }
}

export async function verifyAddressMigration(): Promise<void> {
  await runApp(async () => {
    const callouts: CalloutRow[] = await dataSource.manager.query(
      `SELECT id, slug, "formSchema" FROM callout WHERE "formSchema" IS NOT NULL`
    );

    console.log(`Checking ${callouts.length} callouts with formSchema...\n`);

    let grandTotalResponses = 0;
    let grandTotalAddressAnswers = 0;
    let grandTotalFailures = 0;
    let grandTotalWarnings = 0;

    for (const callout of callouts) {
      const result: CalloutResult = {
        slug: callout.slug,
        schemaIssues: [],
        totalResponses: 0,
        totalAddressAnswers: 0,
        failures: [],
        warnings: [],
        latMin: Infinity,
        latMax: -Infinity,
        lngMin: Infinity,
        lngMax: -Infinity,
      };

      // Collect address and file components from form schema
      const addressComponents: { slideId: string; componentId: string }[] = [];

      for (const slide of callout.formSchema.slides) {
        for (const component of slide.components) {
          if (component.type === 'address') {
            addressComponents.push({
              slideId: slide.id,
              componentId: component.id,
            });
            if (component.provider !== 'maptiler') {
              result.schemaIssues.push(
                `slide "${slide.id}" component "${component.id}": provider is "${component.provider}", expected "maptiler"`
              );
            }
          }
          if (component.type === 'file' && component.storage !== 'beabee') {
            result.schemaIssues.push(
              `slide "${slide.id}" component "${component.id}": storage is "${component.storage}", expected "beabee"`
            );
          }
        }
      }

      if (addressComponents.length === 0) {
        console.log(
          `  ${callout.slug} — no address components, skipping responses`
        );
        continue;
      }

      // Check responses
      const responses: ResponseRow[] = await dataSource.manager.query(
        `SELECT id, answers FROM callout_response WHERE "calloutId" = $1`,
        [callout.id]
      );
      result.totalResponses = responses.length;

      for (const response of responses) {
        for (const { slideId, componentId } of addressComponents) {
          const slideAnswers = response.answers[slideId];
          if (!slideAnswers) continue;
          const raw = slideAnswers[componentId];
          if (raw == null) continue;
          checkAddressAnswer(
            raw as AddressAnswer,
            `response ${response.id} [${slideId}.${componentId}]`,
            result
          );
        }
      }

      const schemaStatus =
        result.schemaIssues.length === 0
          ? '✓ formSchema OK'
          : `✗ formSchema ISSUES`;
      console.log(
        `  ${callout.slug} — ${schemaStatus} | ${result.totalResponses} responses, ${result.totalAddressAnswers} address answers`
      );

      if (result.schemaIssues.length > 0) {
        for (const issue of result.schemaIssues) {
          console.log(`    ✗ Schema: ${issue}`);
        }
      }

      if (result.totalAddressAnswers > 0 && isFinite(result.latMin)) {
        console.log(
          `    Coordinates: lat [${result.latMin.toFixed(4)} – ${result.latMax.toFixed(4)}], ` +
            `lng [${result.lngMin.toFixed(4)} – ${result.lngMax.toFixed(4)}]`
        );
      }

      if (result.failures.length > 0) {
        for (const f of result.failures) {
          console.log(`    ✗ FAIL: ${f}`);
        }
      }
      const warnCount = result.warnings.length;
      if (warnCount > 0) {
        console.log(
          `    ⚠ ${warnCount} warning(s) (run with details to see all)`
        );
      }

      grandTotalResponses += result.totalResponses;
      grandTotalAddressAnswers += result.totalAddressAnswers;
      grandTotalFailures += result.failures.length + result.schemaIssues.length;
      grandTotalWarnings += result.warnings.length;
    }

    console.log(
      `\nSummary: ${grandTotalResponses} responses checked | ${grandTotalAddressAnswers} address answers | ` +
        `${grandTotalFailures} FAILURES | ${grandTotalWarnings} warnings`
    );

    if (grandTotalFailures === 0) {
      console.log('✅ Migration looks correct.');
    } else {
      console.error('❌ Migration has failures — see details above.');
      process.exit(1);
    }
  });
}
