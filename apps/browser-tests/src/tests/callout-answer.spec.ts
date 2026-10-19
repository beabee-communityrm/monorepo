import { api, testUser as admin } from "@beabee/test-utils/test-data";
import { test, expect, waitForForm } from "../utils/fixtures";
import { answer, answerRow, getResponses } from "../utils/callout-response";

test(
  "Member answers, then adds another",
  { tag: "@experimental" },
  async ({ page, request, createCallout, createContact }) => {
    const slug = await createCallout({
      access: "anonymous",
      responseMode: "multiple",
    });
    const contact = await createContact();

    const getStarted = page.getByRole("link", { name: "Get started" });
    const addAnother = page.getByRole("link", {
      name: "Add another response",
    });

    await test.step("Details page offers Get started", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(getStarted).toBeVisible();
    });

    await test.step("Answer and submit", async () => {
      await getStarted.click();
      await answer(page, "First answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
      await expect(answerRow(page)).toHaveText("First answer");
    });

    await test.step("Details page shows the response", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(answerRow(page)).toHaveText("First answer");
      await expect(addAnother).toBeVisible();
      await expect(getStarted).toBeHidden();
    });

    await test.step("Add another opens an empty form", async () => {
      await addAnother.click();
      await waitForForm(page);
      await expect(page.getByRole("textbox", { name: "Question" })).toBeEmpty();
      await answer(page, "Second answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    });

    await test.step("Details page pages through both, newest first", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(
        page.getByRole("heading", { name: "Your responses (2)" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Response 2 of 2" }),
      ).toBeVisible();
      await expect(answerRow(page)).toHaveText("Second answer");

      await page.getByRole("button", { name: "Previous response" }).click();
      await expect(
        page.getByRole("heading", { name: "Response 1 of 2" }),
      ).toBeVisible();
      await expect(answerRow(page)).toHaveText("First answer");
    });

    await test.step("API has both responses from the member", async () => {
      const responses = await getResponses(request, slug);
      expect(responses).toHaveLength(2);
      expect(responses.map((r: { answers: unknown }) => r.answers)).toEqual([
        { slide1: { question: "First answer" } },
        { slide1: { question: "Second answer" } },
      ]);
      for (const response of responses) {
        expect(response.contact?.id).toBe(contact.id);
      }
    });
  },
);

test(
  "Member answers, then edits",
  { tag: "@experimental" },
  async ({ page, request, createCallout, createContact }) => {
    const slug = await createCallout({
      access: "anonymous",
      responseMode: "single-editable",
    });
    await createContact();

    const edit = page.getByRole("link", { name: "Edit response" });
    let responseId: string;

    await test.step("Answer and submit", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await page.getByRole("link", { name: "Get started" }).click();
      await answer(page, "First answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    });

    await test.step("Details page offers Edit only", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(answerRow(page)).toHaveText("First answer");
      await expect(edit).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Add another response" }),
      ).toBeHidden();
      await expect(
        page.getByRole("link", { name: "Get started" }),
      ).toBeHidden();
      responseId = (await getResponses(request, slug))[0].id;
    });

    await test.step("Edit opens the form filled in", async () => {
      await edit.click();
      await waitForForm(page);
      await expect(page.getByRole("textbox", { name: "Question" })).toHaveValue(
        "First answer",
      );
      await answer(page, "Edited answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    });

    await test.step("Details page shows the edited response", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(
        page.getByRole("heading", { name: "Your response", exact: true }),
      ).toBeVisible();
      await expect(answerRow(page)).toHaveText("Edited answer");
      await expect(edit).toBeVisible();
    });

    await test.step("API has the same response with the new answer", async () => {
      const responses = await getResponses(request, slug);
      expect(responses).toHaveLength(1);
      expect(responses[0].id).toBe(responseId);
      expect(responses[0].answers).toEqual({
        slide1: { question: "Edited answer" },
      });
    });

    await test.step("Once closed, the response can't be edited", async () => {
      const closed = await request.patch(
        `${api.host}${api.path}/callout/${slug}`,
        {
          headers: { Authorization: `Bearer ${admin.apiKey}` },
          data: { expires: new Date(Date.now() - 1000) },
        },
      );
      expect(closed.ok(), await closed.text()).toBeTruthy();

      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(answerRow(page)).toHaveText("Edited answer");
      await expect(
        page.getByText("responses can no longer be added or edited"),
      ).toBeVisible();
      await expect(edit).toBeHidden();
    });
  },
);

test(
  "Member answers a single-response CrowdNewsroom",
  { tag: "@experimental" },
  async ({ page, createCallout, createContact }) => {
    const slug = await createCallout({
      access: "anonymous",
      responseMode: "single",
    });
    await createContact();

    await test.step("Answer and submit", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await page.getByRole("link", { name: "Get started" }).click();
      await answer(page, "Only answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    });

    await test.step("Details page offers no way to respond again", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(answerRow(page)).toHaveText("Only answer");
      for (const name of [
        "Get started",
        "Edit response",
        "Add another response",
      ]) {
        await expect(page.getByRole("link", { name })).toBeHidden();
      }
    });

    await test.step("Respond page shows the response instead of the form", async () => {
      await page.goto(`/crowdnewsroom/${slug}/respond`);
      await expect(answerRow(page)).toHaveText("Only answer");
      await expect(
        page.getByRole("textbox", { name: "Question" }),
      ).toBeHidden();
    });
  },
);

test(
  "Only-anonymous responses aren't linked to the member",
  { tag: "@experimental" },
  async ({ page, context, baseURL, request, createCallout, createContact }) => {
    const slug = await createCallout({
      access: "only-anonymous",
      responseMode: "multiple",
    });
    await createContact();

    await test.step("Member answers and submits", async () => {
      await page.goto(`/crowdnewsroom/${slug}/respond`);
      await answer(page, "Anonymous answer");
      await page.waitForURL(`**/crowdnewsroom/${slug}/thanks`);
    });

    await test.step("Details page doesn't show it as theirs", async () => {
      await page.goto(`/crowdnewsroom/${slug}`);
      await expect(
        page.getByRole("link", { name: "Get started" }),
      ).toBeVisible();
      await expect(answerRow(page)).toBeHidden();
    });

    await test.step("API has the response with no contact", async () => {
      const responses = await getResponses(request, slug);
      expect(responses).toHaveLength(1);
      expect(responses[0].contact).toBeNull();
    });

    await test.step("Logged out, there are no name and email fields", async () => {
      await context.clearCookies();
      await context.addCookies([
        { name: "beabee_frontend", value: "new", url: baseURL! },
      ]);
      await page.goto(`/crowdnewsroom/${slug}/respond`);
      await waitForForm(page);
      await expect(
        page.getByRole("textbox", { name: "Question" }),
      ).toBeVisible();
      await expect(page.getByText("Contact details")).toBeHidden();
      await expect(page.getByRole("textbox", { name: "Email" })).toBeHidden();
    });
  },
);

test(
  "Custom thanks redirect",
  { tag: "@experimental" },
  async ({ page, createCallout }) => {
    // The API only accepts a URL with a top-level domain, so redirect off-site
    // and answer it here rather than over the network
    const thanksRedirect = "https://example.com/thanks";
    await page.route(thanksRedirect, (route) =>
      route.fulfill({ body: "Redirected" }),
    );
    const slug = await createCallout({
      access: "anonymous",
      responseMode: "multiple",
      thanksRedirect,
    });

    await page.goto(`/crowdnewsroom/${slug}/respond`);
    await answer(page, "Redirected answer");
    await page.waitForURL(thanksRedirect);
  },
);
