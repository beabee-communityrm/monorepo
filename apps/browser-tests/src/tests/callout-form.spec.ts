import type { Page } from "@playwright/test";
import { test, expect, waitForForm } from "../utils/fixtures";
import { getResponses } from "../utils/callout-response";
import type { CalloutSlide } from "../types/callout";

const textfield = (key: string, label: string, extra = {}) => ({
  id: key,
  key,
  type: "textfield",
  label,
  input: true,
  validate: { required: false },
  ...extra,
});

const radio = (
  key: string,
  label: string,
  values: { label: string; value: string; nextSlideId?: string }[],
) => ({
  id: key,
  key,
  type: "radio",
  label,
  input: true,
  validate: { required: false },
  values,
});

// Slide 1 decides whether slide 2 is skipped, and holds a question that only
// shows for one answer to another
const slides: CalloutSlide[] = [
  {
    id: "slide1",
    components: [
      textfield("required", "Required question", {
        validate: { required: true },
      }),
      radio("showExtra", "Show the extra question?", [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ]),
      textfield("extra", "Extra question", {
        conditional: { show: true, when: "showExtra", eq: "yes" },
      }),
      radio("route", "Which way?", [
        { label: "Through slide 2", value: "through", nextSlideId: "slide2" },
        { label: "Skip slide 2", value: "skip", nextSlideId: "slide3" },
      ]),
    ],
  },
  { id: "slide2", components: [textfield("slide2", "Slide 2 question")] },
  { id: "slide3", components: [textfield("slide3", "Slide 3 question")] },
];

const textbox = (page: Page, name: string) =>
  page.getByRole("textbox", { name });

/** Fills a text question and commits it, as answers only commit on blur */
async function fill(page: Page, name: string, text: string) {
  await textbox(page, name).fill(text);
  await page.keyboard.press("Tab");
}

const row = (page: Page, label: string) =>
  page
    .locator("dl > div")
    .filter({ has: page.getByRole("term").getByText(label, { exact: true }) });

test("Member works through slides and conditional questions", async ({
  page,
  request,
  createCallout,
  createContact,
}) => {
  const slug = await createCallout({
    access: "anonymous",
    responseMode: "multiple",
    slides,
  });
  await createContact();

  const next = page.getByRole("button", { name: "Next" });
  const back = page.getByRole("button", { name: "Back" });

  await page.goto(`/crowdnewsroom/${slug}/respond`);
  await waitForForm(page);

  await test.step("Required question blocks Next", async () => {
    await page.getByRole("radio", { name: "Through slide 2" }).check();
    await expect(next).toBeDisabled();
  });

  await test.step("Back keeps answers", async () => {
    await fill(page, "Required question", "Required answer");
    await expect(next).toBeEnabled();
    await next.click();
    await waitForForm(page);
    await expect(textbox(page, "Slide 2 question")).toBeVisible();
    await fill(page, "Slide 2 question", "Slide 2 answer");
    await back.click();
    await waitForForm(page);
    await expect(textbox(page, "Required question")).toHaveValue(
      "Required answer",
    );
  });

  await test.step("Conditional question shows and hides", async () => {
    await expect(textbox(page, "Extra question")).toBeHidden();
    await page.getByRole("radio", { name: "Yes" }).check();
    await expect(textbox(page, "Extra question")).toBeVisible();
    await fill(page, "Extra question", "Extra answer");
    await page.getByRole("radio", { name: "No" }).check();
    await expect(textbox(page, "Extra question")).toBeHidden();
  });

  await test.step("Answer skips a slide", async () => {
    await page.getByRole("radio", { name: "Skip slide 2" }).check();
    await next.click();
    await waitForForm(page);
    await expect(textbox(page, "Slide 3 question")).toBeVisible();
    await expect(textbox(page, "Slide 2 question")).toBeHidden();
    await fill(page, "Slide 3 question", "Slide 3 answer");
    await page.getByRole("button", { name: "Submit" }).click();
    await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
  });

  await test.step("Skipped and hidden answers left out of the response", async () => {
    await expect(row(page, "Slide 3 question")).toBeVisible();
    await expect(row(page, "Slide 2 question")).toBeHidden();
    await expect(row(page, "Extra question")).toBeHidden();

    const [response] = await getResponses(request, slug);
    expect(response.answers.slide1.required).toBe("Required answer");
    expect(response.answers.slide3.slide3).toBe("Slide 3 answer");
    expect(response.answers.slide2).toBeUndefined();
    expect(response.answers.slide1.extra).toBeUndefined();
  });
});

test("Answers passed in the URL prefill the form", async ({
  page,
  createCallout,
}) => {
  const slug = await createCallout({
    access: "anonymous",
    responseMode: "multiple",
  });

  const answers = JSON.stringify({ slide1: { question: "Prefilled answer" } });
  await page.goto(
    `/crowdnewsroom/${slug}/respond?answers=${encodeURIComponent(answers)}`,
  );
  await waitForForm(page);
  await expect(textbox(page, "Question")).toHaveValue("Prefilled answer");
});

test("Name and email on a guest CrowdNewsroom", async ({
  page,
  createCallout,
}) => {
  const slug = await createCallout({
    access: "guest",
    responseMode: "single",
  });

  await page.goto(`/crowdnewsroom/${slug}/respond`);

  await test.step("Name and email are required", async () => {
    await waitForForm(page);
    await fill(page, "Question", "Guest answer");
    for (const name of ["First name", "Last name", "Email"]) {
      await expect(textbox(page, name)).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  await test.step("Submitting with them shows the one-response warning", async () => {
    // The backend links a guest response to a contact with the same email, so
    // use one no contact has
    await textbox(page, "First name").fill("Guest");
    await textbox(page, "Last name").fill("Respondent");
    await textbox(page, "Email").fill(
      `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    );
    await page.getByRole("button", { name: "Submit" }).click();
    await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    await expect(
      page.getByText("only one response is allowed per person"),
    ).toBeVisible();
  });
});
