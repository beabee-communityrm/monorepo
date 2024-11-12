import "module-alias/register";

import {
  CalloutComponentSchema,
  CalloutComponentType,
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
  getCalloutComponents
} from "@beabee/beabee-common";
import { getRepository, runTransaction } from "@beabee/core/database";
import { Callout, CalloutResponse, Contact } from "@beabee/core/models";
import { runApp } from "@core/server";
import { parse } from "csv-parse";
import { In } from "typeorm";

interface ResponseRow {
  [key: string]: string;
  contact_email?: string;
  guest_name?: string;
  guest_email?: string;
  bucket?: string;
  created_at?: string;
}

const metadataHeaders = [
  "contact_email",
  "guest_email",
  "guest_name",
  "bucket",
  "created_at"
];

async function loadRows(headers: string[]): Promise<ResponseRow[]> {
  return new Promise((resolve) => {
    const rows: ResponseRow[] = [];

    process.stdin
      .pipe(parse({ columns: true, skipEmptyLines: true }))
      .on("data", (row) => {
        if (Object.keys(row).every((key) => headers.includes(key))) {
          rows.push(row);
        } else {
          console.error("Invalid row", row);
        }
      })
      .on("end", () => {
        resolve(rows);
      });
  });
}

async function loadContactIds(
  rows: ResponseRow[]
): Promise<Record<string, string>> {
  const contactEmails = rows
    .map((r) => r.contact_email)
    .filter((s): s is string => !!s);
  const contacts = await getRepository(Contact).find({
    select: { id: true, email: true },
    where: { email: In(contactEmails) }
  });

  return contacts.reduce(
    (acc, c) => ({ ...acc, [c.email]: c.id }),
    {} as Record<string, string>
  );
}

function parseValue(
  component: CalloutComponentSchema,
  value: string
): CalloutResponseAnswer {
  switch (component.type) {
    case CalloutComponentType.INPUT_NUMBER:
      return parseFloat(value);

    case CalloutComponentType.INPUT_CHECKBOX:
      return value.toLowerCase() === "true" || value === "1";

    case CalloutComponentType.INPUT_SELECTABLE_RADIO:
    case CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES:
      return value
        .split(",")
        .map((v) => v.trim())
        .reduce((acc, v) => ({ ...acc, [v]: true }), {});

    case CalloutComponentType.INPUT_ADDRESS:
      const [lat, lng] = value.split(",").map((v) => parseFloat(v));
      return {
        geometry: { location: { lat, lng } },
        formatted_address: ""
      } satisfies CalloutResponseAnswerAddress;

    case CalloutComponentType.INPUT_FILE:
      return {
        url: value
      } satisfies CalloutResponseAnswerFileUpload;

    default:
      return value;
  }
}

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

    const [slideId, answerKey] = key.split(".");
    if (!answers[slideId]) {
      answers[slideId] = {};
    }
    answers[slideId][answerKey] = parseValue(componentsByKey[key], value);
  }

  return getRepository(CalloutResponse).create({
    calloutId,
    contactId:
      (row.contact_email && contactIdsByEmail[row.contact_email]) || null,
    number,
    guestName: row.guest_name || null,
    guestEmail: row.guest_email || null,
    answers,
    bucket: row.bucket || "",
    ...(row.created_at && { createdAt: new Date(row.created_at) })
  });
}

runApp(async () => {
  if (!process.argv[2]) {
    console.error("Usage: import-callout-responses <callout-slug>");
    process.exit(1);
  }

  const callout = await getRepository(Callout).findOneByOrFail({
    slug: process.argv[2]
  });

  console.error(`Importing responses for callout ${callout.slug}`);

  const calloutComponents = getCalloutComponents(callout.formSchema);
  const headers = [
    ...calloutComponents.map((c) => c.fullKey),
    ...metadataHeaders
  ];

  console.error(`Possible headers: ${headers.join(", ")}`);

  const rows = await loadRows(headers);

  console.error(`Processing ${rows.length} rows`);

  const contactIdByEmail = await loadContactIds(rows);
  const calloutComponentsByKey: Record<string, CalloutComponentSchema> =
    calloutComponents.reduce((acc, c) => ({ ...acc, [c.fullKey]: c }), {});

  const lastResponseByNumber = await getRepository(CalloutResponse).findOne({
    where: { calloutId: callout.id },
    order: { number: "DESC" },
    select: { number: true }
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
