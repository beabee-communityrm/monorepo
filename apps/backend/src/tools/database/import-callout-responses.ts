import 'module-alias/register';

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

import { isURL } from 'class-validator';
import { parse } from 'csv-parse';
import { In } from 'typeorm';

interface ResponseRow {
  [key: string]: string;
  contact_email?: string;
  guest_name?: string;
  guest_email?: string;
  bucket?: string;
  created_at?: string;
}

/**
 * Standard metadata headers
 * - contact_email: The contact's email address
 * - guest_email: The guest's email address
 * - guest_name: The guest's name
 * - bucket: The response bucket
 * - created_at: The response creation date
 *
 * Note if contact_email is non-empty and matches a valid contact, the
 * guest_name and guest_email fields will be ignored
 */
const metadataHeaders = [
  'contact_email',
  'guest_email',
  'guest_name',
  'bucket',
  'created_at',
];

/**
 * Load rows from stdin and filter out invalid rows
 *
 * @param headers Allowed headers
 * @returns Valid rows
 */
async function loadRows(headers: string[]): Promise<ResponseRow[]> {
  return new Promise((resolve) => {
    const rows: ResponseRow[] = [];

    process.stdin
      .pipe(parse({ columns: true, skipEmptyLines: true }))
      .on('data', (row) => {
        if (Object.keys(row).every((key) => headers.includes(key))) {
          rows.push(row);
        } else {
          console.error('Invalid row', row);
        }
      })
      .on('end', () => {
        resolve(rows);
      });
  });
}

/**
 * Loads contact IDs for the given contact emails
 *
 * @param rows CSV response rows
 * @returns A mapping from contact email to contact ID
 */
async function loadContactIds(
  rows: ResponseRow[]
): Promise<Record<string, string>> {
  const contactEmails = rows
    .map((r) => r.contact_email)
    .filter((s): s is string => !!s)
    .filter((s, i, a) => a.indexOf(s) === i);
  const contacts = await getRepository(Contact).find({
    select: { id: true, email: true },
    where: { email: In(contactEmails) },
  });

  return contacts.reduce(
    (acc, c) => ({ ...acc, [c.email]: c.id }),
    {} as Record<string, string>
  );
}

/**
 * Parse the value pased on the component type
 *
 * @param component The component
 * @param value The value
 * @returns The parsed value
 */
function parseValue(
  component: CalloutComponentSchema,
  value: string
): CalloutResponseAnswer {
  value = value.trim();

  switch (component.type) {
    case CalloutComponentType.INPUT_NUMBER:
      return parseFloat(value);

    case CalloutComponentType.INPUT_CHECKBOX:
      return value.toLowerCase() === 'true' || value === '1';

    case CalloutComponentType.INPUT_SELECT:
      // Map labels to values or fallback to the original value
      return (
        component.data.values.find((v) => v.label === value)?.value || value
      );

    case CalloutComponentType.INPUT_SELECTABLE_RADIO:
      // Map labels to values or fallback to the original value
      return component.values.find((v) => v.label === value)?.value || value;

    case CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES:
      return (
        value
          .split(',')
          .map((v) => v.trim())
          // Map labels to values or fallback to the original value
          .map((v) => component.values.find((vv) => vv.label === v)?.value || v)
          .reduce((acc, v) => ({ ...acc, [v]: true }), {})
      );

    case CalloutComponentType.INPUT_ADDRESS:
      const [lat, lng, ...rest] = value.split(',');
      return {
        geometry: { location: { lat: Number(lat), lng: Number(lng) } },
        formatted_address: rest.join(','),
      } satisfies CalloutResponseAnswerAddress;

    // TODO: We need to upload the image or document
    case CalloutComponentType.INPUT_FILE:
      const isValueUrl = isURL(value);
      let path: string;
      let url: string;

      if (isValueUrl) {
        // It's a URL, extract path
        url = value;
        // Extract path by removing base URL parts
        const urlObj = new URL(value);
        // Remove /api/1.0/ prefix if it exists
        path = urlObj.pathname.replace(/^\/api\/1\.0\//, '');
      } else {
        // It's a path, construct URL
        path = value;
        // Ensure path doesn't start with slash
        if (path.startsWith('/')) {
          path = path.substring(1);
        }
        // Construct full URL
        url = `${config.audience}/api/1.0/${path}`;
      }

      return {
        url,
        path,
      } satisfies CalloutResponseAnswerFileUpload;

    default:
      return value;
  }
}

/**
 * Create a CalloutResponse from a row
 *
 * @param row The row
 * @param calloutId The associated callout ID
 * @param number The response number
 * @param contactIdsByEmail A mapping of contact emails to IDs
 * @param componentsByKey A mapping of component keys to schemas
 * @returns A CalloutResponse
 */
function createResponse(
  row: ResponseRow,
  calloutId: string,
  number: number,
  contactIdsByEmail: Record<string, string>,
  componentsByKey: Record<string, CalloutComponentSchema>
): CalloutResponse {
  const answers: CalloutResponseAnswersSlide = {};
  for (const [key, value] of Object.entries(row)) {
    if (metadataHeaders.includes(key)) {
      continue;
    }

    const [slideId, answerKey] = key.split('.');
    if (!answers[slideId]) {
      answers[slideId] = {};
    }
    answers[slideId][answerKey] = parseValue(componentsByKey[key], value);
  }

  const contactId =
    (row.contact_email && contactIdsByEmail[row.contact_email]) || null;

  return getRepository(CalloutResponse).create({
    calloutId,
    contactId,
    number,
    guestName: (!contactId && row.guest_name) || null,
    guestEmail: (!contactId && row.guest_email) || null,
    answers,
    bucket: row.bucket || '',
    ...(row.created_at && { createdAt: new Date(row.created_at) }),
  });
}

runApp(async () => {
  if (!process.argv[2]) {
    console.error('Usage: import-callout-responses <callout-slug>');
    process.exit(1);
  }

  const callout = await getRepository(Callout).findOneByOrFail({
    slug: process.argv[2],
  });

  console.error(`Importing responses for callout ${callout.slug}`);

  const calloutComponents = getCalloutComponents(callout.formSchema);
  const headers = [
    ...calloutComponents.map((c) => c.fullKey),
    ...metadataHeaders,
  ];

  console.error(`Possible headers: ${headers.join(', ')}`);

  const rows = await loadRows(headers);

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

  const calloutResponses: CalloutResponse[] = rows.map((row, i) =>
    createResponse(
      row,
      callout.id,
      nextNumber + i,
      contactIdByEmail,
      calloutComponentsByKey
    )
  );

  await runTransaction(async (manager) => {
    await manager.save(calloutResponses);
  });
});
