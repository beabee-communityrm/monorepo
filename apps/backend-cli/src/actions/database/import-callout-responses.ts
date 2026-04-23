/**
 * Import Callout Responses Module
 *
 * Imports callout responses from a CSV file (or stdin) into the database.
 * CSV column headers must be `slideId.componentKey` (see `getCalloutComponents`
 * for the expected fullKey format) plus optional metadata columns.
 *
 * Metadata columns:
 *   - contact_email: if present and matches an existing contact, overrides guest_*
 *   - guest_email
 *   - guest_name
 *   - bucket
 *   - created_at: parsed with --date-format (default ISO)
 */
import {
  CalloutComponentSchema,
  CalloutComponentType,
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
  getCalloutComponents,
} from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { getRepository, runTransaction } from '@beabee/core/database';
import { Callout, CalloutResponse, Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  getSelectableValueFromLabel,
  parseSelectableMultiValue,
} from '@beabee/core/utils';

import { isURL } from 'class-validator';
import { parse } from 'csv-parse';
import moment from 'moment';
import { createReadStream } from 'node:fs';
import type { Readable } from 'node:stream';
import { In } from 'typeorm';

import type {
  ImportCalloutResponsesArgs,
  ResponseRow,
} from '../../types/database.js';

const metadataHeaders = [
  'contact_email',
  'guest_email',
  'guest_name',
  'bucket',
  'created_at',
];

async function loadRows(
  stream: Readable,
  headers: string[]
): Promise<ResponseRow[]> {
  return new Promise((resolve, reject) => {
    const rows: ResponseRow[] = [];
    stream
      .pipe(parse({ columns: true, skip_empty_lines: true, bom: true }))
      .on('data', (row) => {
        if (Object.keys(row).every((key) => headers.includes(key))) {
          rows.push(row);
        } else {
          console.error('Invalid row', row);
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function loadContactIds(
  rows: ResponseRow[]
): Promise<Record<string, string>> {
  const contactEmails = rows
    .map((r) => r.contact_email)
    .filter((s): s is string => !!s)
    .filter((s, i, a) => a.indexOf(s) === i);
  if (contactEmails.length === 0) return {};

  const contacts = await getRepository(Contact).find({
    select: { id: true, email: true },
    where: { email: In(contactEmails) },
  });

  return contacts.reduce(
    (acc, c) => ({ ...acc, [c.email]: c.id }),
    {} as Record<string, string>
  );
}

function parseValue(
  component: CalloutComponentSchema,
  value: string,
  onWarn: (msg: string) => void
): CalloutResponseAnswer {
  value = value.trim();

  switch (component.type) {
    case CalloutComponentType.INPUT_NUMBER:
      return parseFloat(value);

    case CalloutComponentType.INPUT_CHECKBOX:
      return value.toLowerCase() === 'true' || value === '1';

    case CalloutComponentType.INPUT_SELECT:
    case CalloutComponentType.INPUT_SELECTABLE_RADIO:
      return getSelectableValueFromLabel(component, value);

    case CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES:
      return parseSelectableMultiValue(component, value, (unknown) =>
        onWarn(
          `unknown option "${unknown}" for ${component.key} — keeping raw value`
        )
      );

    case CalloutComponentType.INPUT_ADDRESS: {
      const [lat, lng, ...rest] = value.split(',');
      return {
        geometry: { location: { lat: Number(lat), lng: Number(lng) } },
        formatted_address: rest.join(','),
      } satisfies CalloutResponseAnswerAddress;
    }

    case CalloutComponentType.INPUT_FILE: {
      const isValueUrl = isURL(value);
      let path: string;
      let url: string;

      if (isValueUrl) {
        url = value;
        const urlObj = new URL(value);
        path = urlObj.pathname.replace(/^\/api\/1\.0\//, '');
      } else {
        path = value.startsWith('/') ? value.substring(1) : value;
        url = `${config.audience}/api/1.0/${path}`;
      }

      return { url, path } satisfies CalloutResponseAnswerFileUpload;
    }

    default:
      return value;
  }
}

function parseCreatedAt(
  raw: string,
  format: string,
  onWarn: (msg: string) => void
): Date | undefined {
  if (!raw) return undefined;
  const m = moment(raw, format, true);
  if (m.isValid()) return m.toDate();

  const fallback = new Date(raw);
  if (!isNaN(fallback.getTime())) {
    onWarn(
      `created_at "${raw}" did not match --date-format "${format}"; fell back to Date()`
    );
    return fallback;
  }

  onWarn(`created_at "${raw}" could not be parsed; leaving unset`);
  return undefined;
}

function createResponse(
  row: ResponseRow,
  calloutId: string,
  number: number,
  contactIdsByEmail: Record<string, string>,
  componentsByKey: Record<string, CalloutComponentSchema>,
  dateFormat: string,
  onWarn: (msg: string) => void
): CalloutResponse {
  const answers: CalloutResponseAnswersSlide = {};
  for (const [key, value] of Object.entries(row)) {
    if (metadataHeaders.includes(key)) continue;

    const [slideId, answerKey] = key.split('.');
    if (!answers[slideId]) answers[slideId] = {};
    answers[slideId][answerKey] = parseValue(
      componentsByKey[key],
      value,
      onWarn
    );
  }

  const contactId =
    (row.contact_email && contactIdsByEmail[row.contact_email]) || null;

  const createdAt = parseCreatedAt(row.created_at || '', dateFormat, onWarn);

  return getRepository(CalloutResponse).create({
    calloutId,
    contactId,
    number,
    guestName: (!contactId && row.guest_name) || null,
    guestEmail: (!contactId && row.guest_email) || null,
    answers,
    bucket: row.bucket || '',
    ...(createdAt && { createdAt }),
  });
}

export const importCalloutResponses = async (
  args: ImportCalloutResponsesArgs
): Promise<void> => {
  await runApp(async () => {
    const callout = await getRepository(Callout).findOneByOrFail({
      slug: args.slug,
    });

    console.error(`Importing responses for callout ${callout.slug}`);

    const calloutComponents = getCalloutComponents(callout.formSchema);
    const headers = [
      ...calloutComponents.map((c) => c.fullKey),
      ...metadataHeaders,
    ];

    console.error(`Possible headers: ${headers.join(', ')}`);

    const stream: Readable = args.file
      ? createReadStream(args.file)
      : process.stdin;
    const rows = await loadRows(stream, headers);

    console.error(`Processing ${rows.length} rows`);

    const contactIdByEmail = await loadContactIds(rows);
    const calloutComponentsByKey: Record<string, CalloutComponentSchema> =
      calloutComponents.reduce((acc, c) => ({ ...acc, [c.fullKey]: c }), {});

    const lastResponseByNumber = await getRepository(CalloutResponse).findOne({
      where: { calloutId: callout.id },
      order: { number: 'DESC' },
      select: { number: true },
    });
    const nextNumber = (lastResponseByNumber?.number || 0) + 1;

    console.error(`Next response number: ${nextNumber}`);

    const warnings: string[] = [];
    const onWarn = (msg: string) => warnings.push(msg);

    const calloutResponses: CalloutResponse[] = rows.map((row, i) =>
      createResponse(
        row,
        callout.id,
        nextNumber + i,
        contactIdByEmail,
        calloutComponentsByKey,
        args.dateFormat,
        onWarn
      )
    );

    if (warnings.length > 0) {
      console.error(`\n${warnings.length} warning(s):`);
      for (const w of warnings) console.error(`  - ${w}`);
    }

    if (args.failOnUnknown && warnings.length > 0) {
      throw new Error(
        `Aborting: ${warnings.length} warning(s) with --fail-on-unknown set`
      );
    }

    if (args.dryRun) {
      console.error(
        `\nDry run: would import ${calloutResponses.length} responses (no DB changes).`
      );
      return;
    }

    await runTransaction(async (manager) => {
      await manager.save(calloutResponses);
    });

    console.error(`Imported ${calloutResponses.length} responses.`);
  });
};
