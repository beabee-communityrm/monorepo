import {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswers,
  CalloutResponseAnswersSlide,
  SetCalloutSlideSchema
} from "@beabee/beabee-common";
import { Chance } from "chance";
import crypto from "crypto";
import { EntityTarget, ObjectLiteral } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import {
  Email,
  EmailMailing,
  Export,
  ExportItem,
  GiftFlow,
  Contact,
  ContactRole,
  ContactProfile,
  Notice,
  Option,
  PageSettings,
  Payment,
  ContactContribution,
  Callout,
  CalloutResponse,
  CalloutResponseTag,
  CalloutTag,
  Project,
  ProjectContact,
  ProjectEngagement,
  Referral,
  ReferralGift,
  Segment,
  SegmentContact,
  SegmentOngoingEmail,
  CalloutResponseComment,
  ResetSecurityFlow,
  Password,
  CalloutVariant
} from "@beabee/core/models";

/**
 * Generic types for object maps
 *
 * Object maps are used to describe how to anonymise each key on an object.
 *
 * Each key can either be a function which returns the correct type or, if the
 * value is an object, it can be a nested object map. Leaf nodes should always
 * be functions.
 *
 * For example, for an object with the shape:
 * {
 *   "foo": "bar",
 *   "baz": {
 *     "qux": "quux"
 *   }
 * }
 *
 * The anonymisation map could be:
 * {
 *  "foo": () => "anon",
 *  "baz": {
 *    "qux": () => "zzzz"
 *  }
 *
 * OR
 * {
 *   "foo": () => "anon",
 *   "baz": () => ({"qux": "zzzz"})
 * }
 */
export type ObjectMap<T> = { [K in keyof T]?: PropertyMap<T[K]> };
export type PropertyMap<T> = ((prop: T) => T) | ObjectMap<T>;

/**
 * A model anonymiser describes how to anonymise a given database model
 */
export interface ModelAnonymiser<T extends ObjectLiteral = ObjectLiteral> {
  model: EntityTarget<T>;
  objectMap: ObjectMap<T>;
}

/**
 * Create a model anonymiser. This is a helper function to ensure that the
 * object map is correctly typed for the given model.
 *
 * @param model The model to anonymise
 * @param objectMap The object map to use for anonymisation
 * @returns A model anonymiser
 */
function createModelAnonymiser<T extends ObjectLiteral>(
  model: EntityTarget<T>,
  objectMap: ObjectMap<T> = {}
): ModelAnonymiser<T> {
  return { model, objectMap };
}

/**
 * Create a callout component anonymiser
 * This function maps the correct anonymisation function to the correct component
 * e.g. for an email component, it will return a random email address
 *
 * @param component The callout component
 * @returns A method that anonymises the answer to the given component
 */
function createComponentAnonymiser(
  component: CalloutComponentSchema
): (
  value: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
) => CalloutResponseAnswer | CalloutResponseAnswer[] | undefined {
  function anonymiseAnswer(v: CalloutResponseAnswer): CalloutResponseAnswer {
    switch (component.type) {
      case "address":
        return {
          formatted_address: chance.address(),
          geometry: {
            location: { lat: chance.latitude(), lng: chance.longitude() }
          }
        };
      case "email":
        return chance.email({ domain: "example.com", length: 10 });
      case "checkbox":
        return chance.pickone([true, false]);
      case "number":
        return chance.integer();
      case "textarea":
        return chance.paragraph();
      case "textfield":
        return chance.sentence();
      case "select":
      case "radio":
      case "selectboxes":
        const values =
          component.type === "select"
            ? component.data.values
            : component.values;
        return chance.pickone(values.map(({ value }) => value));
      default:
        throw new Error("Unknown component type " + component.type);
    }
  }

  return (value) => {
    return (
      value &&
      (Array.isArray(value)
        ? value.map(anonymiseAnswer)
        : anonymiseAnswer(value))
    );
  };
}

/**
 * Create an anonymisation map for callout response answers based on the form
 * schema
 *
 * @param slides
 * @returns
 */
export function createAnswersAnonymiser(
  slides: SetCalloutSlideSchema[]
): ObjectMap<CalloutResponseAnswersSlide> {
  const ret: ObjectMap<CalloutResponseAnswersSlide> = {};

  for (const slide of slides) {
    const slideMap: ObjectMap<CalloutResponseAnswers> = {};
    for (const component of slide.components) {
      if (component.key) {
        slideMap[component.key] = createComponentAnonymiser(component);
      }
    }

    ret[slide.id] = slideMap;
  }

  return ret;
}

// Generic property generators

const chance = new Chance();

function copy<T>(a: T): T {
  return a;
}

function randomId(len: number, prefix?: string) {
  return () =>
    (prefix || "") +
    crypto.randomBytes(6).toString("hex").slice(0, len).toUpperCase();
}

let codeNo = 0;
function uniqueCode(): string {
  codeNo++;
  const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(codeNo / 1000)];
  const no = codeNo % 1000;
  return letter.padStart(2, "A") + (no + "").padStart(3, "0");
}

// Model anonymisers

export const calloutsAnonymiser = createModelAnonymiser(Callout);

export const calloutResponsesAnonymiser = createModelAnonymiser(
  CalloutResponse,
  {
    id: () => uuidv4(),
    contactId: () => uuidv4(),
    assigneeId: () => uuidv4(),
    guestName: () => chance.name(),
    guestEmail: () => chance.email({ domain: "example.com", length: 10 })
  }
);

export const calloutResponseCommentsAnonymiser = createModelAnonymiser(
  CalloutResponseComment,
  {
    id: () => uuidv4(),
    responseId: () => uuidv4(),
    contactId: () => uuidv4(),
    text: () => chance.paragraph()
  }
);

export const calloutResponseTagsAnonymiser = createModelAnonymiser(
  CalloutResponseTag,
  {
    responseId: () => uuidv4(),
    tagId: () => uuidv4()
  }
);

export const calloutTagsAnonymiser = createModelAnonymiser(CalloutTag, {
  id: () => uuidv4(),
  name: () => chance.word(),
  description: () => chance.sentence()
});

export const calloutVariantAnonymiser = createModelAnonymiser(CalloutVariant);

export const contactAnonymiser = createModelAnonymiser(Contact, {
  id: () => uuidv4(),
  email: () => chance.email({ domain: "fake.beabee.io", length: 10 }),
  firstname: () => chance.first(),
  lastname: () => chance.last(),
  password: () => Password.none,
  pollsCode: uniqueCode,
  referralCode: uniqueCode
});

export const contactContributionAnonymiser = createModelAnonymiser(
  ContactContribution,
  {
    contactId: () => uuidv4(),
    customerId: randomId(12, "CU"),
    mandateId: randomId(12, "MD"),
    subscriptionId: randomId(12, "SB")
  }
);

export const contactProfileAnonymiser = createModelAnonymiser(ContactProfile, {
  contactId: () => uuidv4(),
  description: () => chance.sentence(),
  bio: () => chance.paragraph(),
  notes: () => chance.sentence(),
  telephone: () => chance.phone(),
  twitter: () => chance.twitter(),
  deliveryAddress: {
    line1: () => chance.address(),
    line2: () => chance.pickone(["Cabot", "Easton", "Southmead", "Hanham"]),
    city: () => "Bristol",
    postcode: () => "BS1 1AA"
  },
  tags: (tags) => tags.map(() => chance.profession())
});

export const contactRoleAnonymiser = createModelAnonymiser(ContactRole, {
  contactId: () => uuidv4()
});

export const emailAnonymiser = createModelAnonymiser(Email);

export const emailMailingAnonymiser = createModelAnonymiser(EmailMailing, {
  recipients: () => []
});

export const exportsAnonymiser = createModelAnonymiser(Export);

export const exportItemsAnonymiser = createModelAnonymiser(ExportItem, {
  itemId: copy // These will be mapped to values that have already been seen
});

export const giftFlowAnonymiser = createModelAnonymiser(GiftFlow, {
  id: () => uuidv4(),
  setupCode: uniqueCode,
  sessionId: randomId(12),
  giftForm: {
    firstname: () => chance.first(),
    lastname: () => chance.last(),
    email: () => chance.email({ domain: "fake.beabee.io", length: 10 }),
    message: () => chance.sentence(),
    fromName: () => chance.name(),
    fromEmail: () => chance.email({ domain: "fake.beabee.io", length: 10 })
  },
  gifteeId: () => uuidv4()
});

export const noticesAnonymiser = createModelAnonymiser(Notice);

export const optionsAnonymiser = createModelAnonymiser(Option);

export const pageSettingsAnonymiser = createModelAnonymiser(PageSettings);

export const paymentsAnonymiser = createModelAnonymiser(Payment, {
  id: () => uuidv4(),
  subscriptionId: randomId(12, "SB"),
  contactId: () => uuidv4()
});

export const projectsAnonymiser = createModelAnonymiser(Project, {
  ownerId: () => uuidv4()
});

export const projectContactsAnonymiser = createModelAnonymiser(ProjectContact, {
  id: () => uuidv4(),
  contactId: () => uuidv4(),
  tag: () => chance.profession()
});

export const projectEngagmentsAnonymiser = createModelAnonymiser(
  ProjectEngagement,
  {
    id: () => uuidv4(),
    byContactId: () => uuidv4(),
    toContactId: () => uuidv4(),
    notes: () => chance.sentence()
  }
);

export const referralsAnonymiser = createModelAnonymiser(Referral, {
  id: () => uuidv4(),
  referrerId: () => uuidv4(),
  refereeId: () => uuidv4()
});

export const referralsGiftAnonymiser = createModelAnonymiser(ReferralGift, {
  stock: copy // Add to map so it is serialised correctly
});

export const resetSecurityFlowAnonymiser = createModelAnonymiser(
  ResetSecurityFlow,
  {
    id: () => uuidv4(),
    contactId: () => uuidv4()
  }
);

export const segmentsAnonymiser = createModelAnonymiser(Segment);

export const segmentContactsAnonymiser = createModelAnonymiser(SegmentContact, {
  contactId: () => uuidv4()
});

export const segmentOngoingEmailsAnonymiser =
  createModelAnonymiser(SegmentOngoingEmail);
