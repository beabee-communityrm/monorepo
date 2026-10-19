import { test as base, expect } from "@playwright/test";
import { api, testUser as admin } from "@beabee/test-utils/test-data";
import type {
  CalloutSlide,
  CreateCalloutOptions,
  CreateContactOptions,
  TestContact,
} from "../types/callout";

const headers = { Authorization: `Bearer ${admin.apiKey}` };

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const oneQuestion: CalloutSlide[] = [
  {
    id: "slide1",
    components: [
      {
        id: "question",
        key: "question",
        type: "textfield",
        label: "Question",
        input: true,
        validate: { required: false },
      },
    ],
  },
];

export const test = base.extend<{
  newFrontend: void;
  /** Creates a CrowdNewsroom through the admin API and returns its slug */
  createCallout: (options: CreateCalloutOptions) => Promise<string>;
  /** Creates a contact, logs the browser in as them, and deletes them after
   * the test */
  createContact: (options?: CreateContactOptions) => Promise<TestContact>;
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

  createCallout: async ({ request }, use) => {
    await use(
      async ({
        access,
        responseMode,
        slides = oneQuestion,
        expires = null,
        thanksRedirect = null,
      }) => {
        const slug = `test-cnr-${unique()}`;
        const response = await request.post(`${api.host}${api.path}/callout`, {
          headers,
          data: {
            slug,
            image: "images/18e402f3-1ffb-44f9-866a-95b2e0ecf96a.avif",
            starts: new Date(Date.now() - 60_000),
            expires,
            channels: [],
            access,
            captcha: "none",
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
          },
        });
        expect(response.ok(), await response.text()).toBeTruthy();
        return slug;
      },
    );
  },

  createContact: async ({ context, request }, use) => {
    const contactIds: string[] = [];

    await use(async ({ member = true } = {}) => {
      const email = `test-${unique()}@example.com`;
      const password = "testCONTACT123!";
      const created = await request.post(`${api.host}${api.path}/contact`, {
        headers,
        data: {
          email,
          password,
          firstname: "Test",
          lastname: "Contact",
          roles: member
            ? [{ role: "member", dateAdded: new Date(), dateExpires: null }]
            : [],
        },
      });
      expect(created.ok(), await created.text()).toBeTruthy();
      const { id } = await created.json();
      contactIds.push(id);

      const login = await context.request.post(`${api.path}/auth/login`, {
        data: { email, password },
      });
      expect(login.ok(), "Logged in").toBeTruthy();

      return { id, email };
    });

    for (const id of contactIds) {
      await request.delete(`${api.host}${api.path}/contact/${id}`, {
        headers,
      });
    }
  },
});

export { expect };
