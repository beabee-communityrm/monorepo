import type { Locator, Page } from "@playwright/test";
import { api, testUser as admin } from "@beabee/test-utils/test-data";
import { test, expect, waitForForm } from "../utils/fixtures";
import { getResponses } from "../utils/callout-response";

const slideId = "slide1";
const headers = { Authorization: `Bearer ${admin.apiKey}` };

// 1x1 PNG
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// One second of silence, as 8-bit mono WAV at 8kHz
const sampleRate = 8000;
const wav = Buffer.alloc(44 + sampleRate, 128);
wav.write("RIFF", 0);
wav.writeUInt32LE(36 + sampleRate, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); // PCM
wav.writeUInt16LE(1, 22); // Mono
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate, 28); // Bytes per second
wav.writeUInt16LE(1, 32); // Bytes per sample
wav.writeUInt16LE(8, 34); // Bits per sample
wav.write("data", 36);
wav.writeUInt32LE(sampleRate, 40);

const address = "1 Test Street, 10115 Berlin, Germany";

interface Question {
  key: string;
  type: string;
  /** Extra schema for the component, on top of type, key and label */
  schema?: Record<string, unknown>;
  /** Left out to leave the question alone */
  fill?: (page: Page, field: Locator) => Promise<void>;
  /** What the API should hold for the answer */
  stored: (answer: unknown) => void;
  /** What the response list should show for the answer */
  shown: (row: Locator) => Promise<void>;
}

const hasText = (text: string | RegExp) => (row: Locator) =>
  expect.soft(row).toHaveText(text);

const options = (...labels: string[]) =>
  labels.map((label) => ({ label, value: label.toLowerCase() }));

const questions: Question[] = [
  {
    key: "textfield",
    type: "textfield",
    fill: (_, field) => field.locator("input").fill("Hello"),
    stored: (a) => expect.soft(a).toBe("Hello"),
    shown: hasText("Hello"),
  },
  {
    key: "textarea",
    type: "textarea",
    fill: (_, field) => field.locator("textarea").fill("Line one\nLine two"),
    stored: (a) => expect.soft(a).toBe("Line one\nLine two"),
    shown: hasText(/Line one\s+Line two/),
  },
  {
    key: "email",
    type: "email",
    fill: (_, field) => field.locator("input").fill("someone@example.com"),
    stored: (a) => expect.soft(a).toBe("someone@example.com"),
    shown: hasText("someone@example.com"),
  },
  {
    key: "number",
    type: "number",
    fill: (_, field) => field.locator("input").pressSequentially("42"),
    stored: (a) => expect.soft(a).toBe(42),
    shown: hasText("42"),
  },
  {
    key: "phoneNumber",
    type: "phoneNumber",
    fill: (_, field) => field.locator("input").pressSequentially("2079460000"),
    stored: (a) => expect.soft(a).toBe("(207) 946-0000"),
    shown: hasText("(207) 946-0000"),
  },
  {
    key: "url",
    type: "url",
    fill: (_, field) => field.locator("input").fill("https://example.com"),
    stored: (a) => expect.soft(a).toBe("https://example.com"),
    shown: hasText("https://example.com"),
  },
  {
    key: "currency",
    type: "currency",
    schema: { currency: "EUR" },
    fill: (_, field) => field.locator("input").pressSequentially("12.5"),
    stored: (a) => expect.soft(a).toBe(12.5),
    shown: hasText("€12.50"),
  },
  {
    key: "datetime",
    type: "datetime",
    schema: { enableTime: false, format: "yyyy-MM-dd" },
    fill: async (page, field) => {
      await field.locator("input:visible").first().click();
      // Enter would submit the form
      await page.keyboard.type("2026-10-01");
    },
    stored: (a) => expect.soft(String(a)).toContain("2026-10-01"),
    shown: hasText(/2026/),
  },
  {
    key: "time",
    type: "time",
    fill: (_, field) => field.locator("input").fill("14:30"),
    stored: (a) => expect.soft(String(a)).toMatch(/^14:30/),
    shown: hasText(/14:30/),
  },
  {
    key: "checkbox",
    type: "checkbox",
    fill: (_, field) => field.getByRole("checkbox").check(),
    stored: (a) => expect.soft(a).toBe(true),
    shown: hasText("Yes"),
  },
  {
    key: "checkboxUnchecked",
    type: "checkbox",
    stored: (a) => expect.soft(a).toBe(false),
    shown: hasText("No"),
  },
  {
    key: "radio",
    type: "radio",
    schema: { values: options("Red", "Blue") },
    fill: (_, field) => field.getByRole("radio", { name: "Blue" }).check(),
    stored: (a) => expect.soft(a).toBe("blue"),
    shown: hasText("Blue"),
  },
  {
    // Stored as a number, so shown by looking its label up
    key: "radioNumber",
    type: "radio",
    schema: {
      values: [
        { label: "One", value: "1" },
        { label: "Two", value: "2" },
      ],
    },
    fill: (_, field) => field.getByRole("radio", { name: "Two" }).check(),
    stored: (a) => expect.soft(a).toBe(2),
    shown: hasText("Two"),
  },
  {
    key: "selectboxes",
    type: "selectboxes",
    schema: { values: options("Tea", "Coffee") },
    fill: (_, field) => field.getByRole("checkbox", { name: "Coffee" }).check(),
    stored: (a) => expect.soft(a).toEqual({ tea: false, coffee: true }),
    shown: hasText("Coffee"),
  },
  {
    key: "select",
    type: "select",
    schema: { data: { values: options("Small", "Large") } },
    fill: async (page, field) => {
      await field.getByRole("combobox").first().click();
      await page.getByRole("option", { name: "Large" }).click();
    },
    stored: (a) => expect.soft(a).toBe("large"),
    shown: hasText("Large"),
  },
  {
    key: "address",
    type: "address",
    schema: { provider: "maptiler" },
    fill: async (page, field) => {
      await field.locator("input:visible").first().pressSequentially("1 Test");
      await page.getByText(address).click();
    },
    stored: (a) =>
      expect.soft(a).toMatchObject({
        formatted_address: address,
        geometry: { location: { lat: 52.5, lng: 13.4 } },
      }),
    shown: hasText(address),
  },
  {
    key: "addressUntouched",
    type: "address",
    schema: { provider: "maptiler" },
    stored: (a) => expect.soft(a).toEqual({}),
    shown: hasText("Not answered"),
  },
  {
    key: "file",
    type: "file",
    schema: { storage: "beabee" },
    fill: async (page, field) => {
      const fileChooser = page.waitForEvent("filechooser");
      await field.getByRole("link", { name: /upload from device/i }).click();
      await (
        await fileChooser
      ).setFiles({ name: "photo.png", mimeType: "image/png", buffer: png });
      // Wait for the upload to finish before submitting
      await expect(field.getByText("photo.png")).toBeVisible();
    },
    stored: (a) =>
      expect
        .soft(a)
        .toEqual([
          expect.objectContaining({ path: expect.stringMatching(/^images\//) }),
        ]),
    shown: (row) => expect.soft(row.locator("img")).toBeVisible(),
  },
  {
    // Uploaded rather than recorded, as tests have no microphone
    key: "audio",
    type: "audiorecorder",
    schema: { storage: "beabee" },
    fill: async (_, field) => {
      await field
        .getByLabel("Upload an audio file", { exact: true })
        .setInputFiles({
          name: "clip.wav",
          mimeType: "audio/wav",
          buffer: wav,
        });
      // Wait for the upload to finish before submitting
      await expect(field.getByText("Attached")).toBeVisible();
    },
    stored: (a) =>
      expect.soft(a).toEqual([
        expect.objectContaining({
          path: expect.stringMatching(/^audio\//),
          duration: 1,
        }),
      ]),
    shown: async (row) => {
      await expect
        .soft(row.getByRole("button", { name: "Play or pause" }))
        .toBeVisible();
      await expect.soft(row).toContainText("clip.wav");
    },
  },
  {
    key: "unanswered",
    type: "textfield",
    stored: (a) => expect.soft(a ?? "").toBe(""),
    shown: hasText("Not answered"),
  },
];

// Answers the form can't produce, which the admin adds afterwards
const adminOnlyKey = "adminOnly";
const oldUploadKey = "oldUpload";
// An upload from before `path` existed, which only has the deprecated `url`
const oldUpload = { url: "https://example.com/uploads/old-file.pdf" };

const label = (key: string) => `Question ${key}`;

// Prefixed, as formio adds both the type and the key as classes
const fieldKey = (key: string) => `q_${key}`;

const component = (key: string, type: string, schema = {}) => ({
  id: fieldKey(key),
  key: fieldKey(key),
  type,
  label: label(key),
  input: true,
  validate: { required: false },
  ...schema,
});

const rowFor = (page: Page, key: string) =>
  page
    .locator("dl > div")
    .filter({
      has: page.getByRole("term").getByText(label(key), { exact: true }),
    })
    .getByRole("definition");

test("Answer every question type", async ({
  page,
  context,
  request,
  createCallout,
  createContact,
}) => {
  const slug = await createCallout({
    access: "anonymous",
    responseMode: "multiple",
    slides: [
      {
        id: slideId,
        components: [
          ...questions.map((q) => component(q.key, q.type, q.schema)),
          component(adminOnlyKey, "textfield", { adminOnly: true }),
          component(oldUploadKey, "file", { storage: "beabee" }),
        ],
      },
    ],
  });
  await createContact();

  // A canned MapTiler answer, so the address lookup needs no network or key
  await context.route("https://api.maptiler.com/geocoding/**", (route) =>
    route.fulfill({
      json: {
        type: "FeatureCollection",
        query: ["1", "test"],
        features: [
          {
            type: "Feature",
            id: "address.1",
            text: "Test Street",
            address: "1",
            place_name: address,
            place_type: ["address"],
            relevance: 1,
            center: [13.4, 52.5],
            bbox: [13.4, 52.5, 13.4, 52.5],
            geometry: { type: "Point", coordinates: [13.4, 52.5] },
            properties: {},
            context: [],
          },
        ],
      },
    }),
  );

  await page.goto(`/crowdnewsroom/${slug}/respond`);
  await waitForForm(page);

  for (const q of questions) {
    if (!q.fill) continue;
    await test.step(`Fill ${q.key}`, async () => {
      await q.fill!(page, page.locator(`.formio-component-${fieldKey(q.key)}`));
      // Some inputs only commit their value on blur
      await page.keyboard.press("Tab");
    });
  }

  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);

  const [response] = await getResponses(request, slug);
  const answers = response.answers[slideId];

  for (const q of questions) {
    await test.step(`Check ${q.key}`, async () => {
      await q.shown(rowFor(page, q.key));
      q.stored(answers?.[fieldKey(q.key)]);
    });
  }

  await test.step("Admin adds answers the form can't produce", async () => {
    // The request replaces the whole set, so it carries the member's answers
    const updated = await request.patch(
      `${api.host}${api.path}/callout-responses/${response.id}`,
      {
        headers,
        data: {
          answers: {
            [slideId]: {
              ...answers,
              [fieldKey(adminOnlyKey)]: "Reviewer note",
              [fieldKey(oldUploadKey)]: [oldUpload],
            },
          },
        },
      },
    );
    expect(updated.ok(), await updated.text()).toBeTruthy();
    await page.reload();
  });

  await test.step("Check the admin-only answer is left out", async () => {
    await expect.soft(rowFor(page, "textfield")).toHaveText("Hello");
    await expect
      .soft(page.getByText(label(adminOnlyKey), { exact: true }))
      .toBeHidden();
    await expect.soft(page.getByText("Reviewer note")).toBeHidden();
  });

  await test.step("Check the old upload links from its url", async () => {
    await expect
      .soft(rowFor(page, oldUploadKey).getByRole("link"))
      .toHaveAttribute("href", oldUpload.url);
  });
});
