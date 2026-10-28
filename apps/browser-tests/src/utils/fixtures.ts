import { test as base, expect, type Page } from "@playwright/test";
import {
  CalloutCaptcha,
  CalloutComponentType,
  type GetContactData,
} from "@beabee/beabee-common";
import { BeabeeClient } from "@beabee/client";
import { api, testUser } from "@beabee/test-utils/test-data";
import type { CalloutSlide, CreateCalloutOptions } from "../types/callout";

export const admin = new BeabeeClient({
  host: api.host,
  path: api.path,
  token: testUser.apiKey,
});

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const oneQuestion: CalloutSlide[] = [
  {
    id: "slide1",
    components: [
      {
        id: "question",
        key: "question",
        type: CalloutComponentType.INPUT_TEXT_FIELD,
        label: "Question",
        input: true,
        validate: { required: false },
      },
    ],
  },
];

/** Waits for the form to settle, as it's built twice on load and anything
 * filled in before the second build is lost */
export async function waitForForm(page: Page) {
  await page.waitForFunction(() => {
    const builtAt = (window as unknown as { formBuiltAt?: number }).formBuiltAt;
    return builtAt !== undefined && performance.now() - builtAt > 1000;
  });
}

export const test = base.extend<{
  newFrontend: void;
  formBuilds: void;
  /** Creates a CrowdNewsroom through the admin API and returns its slug */
  createCallout: (options: CreateCalloutOptions) => Promise<string>;
  /** Creates a member, logs the browser in as them, and deletes them after
   * the test */
  createContact: () => Promise<GetContactData>;
}>({
  newFrontend: [
    async ({ context, baseURL }, use) => {
      await context.addCookies([
        { name: "beabee_frontend", value: "new", url: baseURL! },
      ]);
      await use();
    },
    { auto: true },
  ],

  // Records when the form was last built, for waitForForm
  formBuilds: [
    async ({ context }, use) => {
      await context.addInitScript(() => {
        new MutationObserver(() => {
          if (document.querySelector(".formio-form")) {
            (window as unknown as { formBuiltAt: number }).formBuiltAt =
              performance.now();
          }
        }).observe(document, { childList: true, subtree: true });
      });
      await use();
    },
    { auto: true },
  ],

  createCallout: async ({}, use) => {
    await use(
      async ({
        access,
        responseMode,
        slides = oneQuestion,
        expires = null,
        thanksRedirect = null,
      }) => {
        const slug = `test-cnr-${unique()}`;
        await admin.callout.create({
          slug,
          image: "images/18e402f3-1ffb-44f9-866a-95b2e0ecf96a.avif",
          starts: new Date(Date.now() - 60_000),
          expires,
          channels: [],
          access,
          captcha: CalloutCaptcha.None,
          responseMode,
          hidden: true,
          sendResponseEmail: false,
          variants: {
            default: {
              title: slug,
              excerpt: slug,
              intro: slug,
              thanksTitle: "Thanks",
              thanksText: "Thanks",
              thanksRedirect,
              shareTitle: null,
              shareDescription: null,
              slideNavigation: Object.fromEntries(
                slides.map((slide) => [
                  slide.id,
                  {
                    prevText: "Back",
                    nextText: "Next",
                    submitText: "Submit",
                  },
                ]),
              ),
              componentText: {},
              responseLinkText: {},
              responseEmailSubject: null,
              responseEmailBody: null,
            },
          },
          formSchema: {
            slides: slides.map((slide) => ({
              id: slide.id,
              title: slide.id,
              components: slide.components,
              navigation: { nextSlideId: slide.nextSlideId ?? "" },
            })),
          },
        });
        return slug;
      },
    );
  },

  createContact: async ({ context }, use) => {
    const contactIds: string[] = [];

    await use(async () => {
      const email = `test-${unique()}@example.com`;
      const password = "testCONTACT123!";
      const contact = await admin.contact.create({
        email,
        password,
        firstname: "Test",
        lastname: "Contact",
        roles: [{ role: "member", dateAdded: new Date(), dateExpires: null }],
      });
      contactIds.push(contact.id);

      // Through the browser, so it holds the session cookie
      const login = await context.request.post(`${api.path}/auth/login`, {
        data: { email, password },
      });
      expect(login.ok(), "Logged in").toBeTruthy();

      return contact;
    });

    for (const id of contactIds) {
      await admin.contact.delete(id);
    }
  },
});

export { expect };
