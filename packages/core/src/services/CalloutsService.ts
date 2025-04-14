import {
  GetCalloutFormSchema,
  CalloutResponseAnswersSlide,
  CalloutAccess,
  CreateCalloutData,
  CalloutResponseGuestData,
  CalloutResponseNewsletterData,
  NewsletterStatus
} from "@beabee/beabee-common";
import slugify from "slugify";
import { BadRequestError } from "routing-controllers";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

import ContactsService from "#services/ContactsService";
import EmailService from "#services/EmailService";
import NewsletterService from "#services/NewsletterService";
import OptionsService from "#services/OptionsService";

import { getRepository, runTransaction } from "#database";
import { log as mainLogger } from "#logging";
import { isDuplicateIndex } from "#utils/db";
import { normalizeEmailAddress } from "#utils/index";

import {
  Contact,
  Callout,
  CalloutResponse,
  CalloutResponseComment,
  CalloutResponseTag,
  CalloutTag,
  CalloutVariant,
  CalloutReviewer
} from "#models/index";

import {
  DuplicateId,
  InvalidCalloutResponse,
  NotFoundError
} from "#errors/index";

const log = mainLogger.child({ app: "callouts-service" });

class CalloutsService {
  /**
   * Create a new callout
   * @param data The callout data
   * @param autoSlug Whether or not to automatically add a number to the slug if it's a duplicate
   * @returns The new callout ID
   */
  async createCallout(
    data: CreateCalloutData,
    autoSlug: number | false
  ): Promise<string> {
    if (!data.variants?.default) {
      throw new BadRequestError(
        "Default variant is required to create callout"
      );
    }

    const baseSlug =
      data.slug || slugify(data.variants.default.title, { lower: true });

    while (true) {
      const slug = baseSlug + (autoSlug ? "-" + autoSlug : "");
      log.info("Creating callout with slug " + slug);
      try {
        return await this.saveCallout({ ...data, slug });
      } catch (err) {
        if (err instanceof DuplicateId && autoSlug !== false) {
          autoSlug++;
        } else {
          throw err;
        }
      }
    }
  }

  /**
   * Update a callout
   * @param id The callout ID
   * @param data The new callout data
   * @returns The updated callout
   */
  async updateCallout(
    id: string,
    data: Partial<CreateCalloutData>
  ): Promise<void> {
    log.info("Updating callout " + id);
    // Prevent the join survey from being made inactive
    if (OptionsService.getText("join-survey") === id) {
      if (data.expires) {
        throw new BadRequestError(
          "Cannot set an expiry date on the join survey"
        );
      } else if (data.starts === null) {
        throw new BadRequestError("Cannot set join survey to draft");
      } else if (data.starts && data.starts > new Date()) {
        throw new BadRequestError("Cannot set join survey to scheduled");
      }
    }

    await this.saveCallout(data, id);
  }

  async duplicateCallout(id: string): Promise<string> {
    const callout = await getRepository(Callout).findOne({
      where: { id },
      relations: { variants: true, tags: true }
    });
    if (!callout) {
      throw new NotFoundError();
    }

    const { id: removeId, tags, variants, ...calloutData } = callout;

    const data: CreateCalloutData = {
      ...calloutData,
      variants: Object.fromEntries(
        variants.map((variant) => [variant.name, variant])
      )
    };

    const newId = await this.createCallout(data, 0);

    if (tags.length > 0) {
      await getRepository(CalloutTag).save(
        tags.map((tag) => {
          const { id, ...newTag } = tag;
          return { ...newTag, calloutId: newId };
        })
      );
    }

    return newId;
  }

  /**
   * Delete a callout and all it's related data
   * @param id The callout ID
   * @returns true if the callout was deleted
   */
  async deleteCallout(id: string): Promise<boolean> {
    log.info("Deleting callout " + id);

    return await runTransaction(async (em) => {
      await em
        .createQueryBuilder()
        .delete()
        .from(CalloutResponseComment)
        .where((qb) => {
          const subQuery = em
            .createQueryBuilder()
            .subQuery()
            .select("id")
            .from(CalloutResponse, "cr")
            .where("cr.calloutId = :id");
          qb.where("responseId IN " + subQuery.getQuery());
        })
        .setParameters({ id })
        .execute();

      await em
        .createQueryBuilder()
        .delete()
        .from(CalloutResponseTag)
        .where((qb) => {
          const subQuery = em
            .createQueryBuilder()
            .subQuery()
            .select("id")
            .from(CalloutResponse, "cr")
            .where("cr.calloutId = :id");
          qb.where("responseId IN " + subQuery.getQuery());
        })
        .setParameters({ id })
        .execute();

      await em.getRepository(CalloutReviewer).delete({ calloutId: id });
      await em.getRepository(CalloutResponse).delete({ calloutId: id });
      await em.getRepository(CalloutVariant).delete({ calloutId: id });
      await em.getRepository(CalloutTag).delete({ calloutId: id });

      const result = await em.getRepository(Callout).delete({ id });

      return result.affected === 1;
    });
  }

  /**
   * Get the most recent response for the given callout and contact
   * @param callout The callout
   * @param contact The contact
   * @returns The most recent response
   */
  async getResponse(
    callout: Callout,
    contact: Contact
  ): Promise<CalloutResponse | null> {
    const response = await getRepository(CalloutResponse).findOne({
      where: {
        calloutId: callout.id,
        contactId: contact.id
      },
      // Get most recent response for callouts with allowMultiple
      order: { createdAt: "DESC" }
    });

    if (response) {
      response.callout = callout;
      response.contact = contact;
    }

    return response;
  }

  /**
   * Creates a response for the given callout and contact, ensuring the contact has
   * the correct access and the callout is active
   * @param callout The callout
   * @param contact The contact
   * @param answers The response answers
   * @returns The new callout response
   */
  async setResponse(
    callout: Callout,
    contact: Contact,
    answers: CalloutResponseAnswersSlide,
    newsletter: CalloutResponseNewsletterData | undefined
  ): Promise<CalloutResponse> {
    if (callout.access === CalloutAccess.OnlyAnonymous) {
      throw new InvalidCalloutResponse("only-anonymous");
    } else if (
      !contact.membership?.isActive &&
      callout.access === CalloutAccess.Member
    ) {
      throw new InvalidCalloutResponse("expired-user");
    } else if (!callout.active) {
      throw new InvalidCalloutResponse("closed");
    }

    let response = await this.getResponse(callout, contact);
    if (!response || callout.allowMultiple) {
      response = new CalloutResponse();
      response.callout = callout;
      response.contact = contact;
    } else if (!callout.allowUpdate) {
      throw new InvalidCalloutResponse("cant-update");
    }

    response.answers = answers;
    response.newsletter = newsletter || null;

    const savedResponse = await this.saveResponse(response);

    if (newsletter?.optIn) {
      await ContactsService.updateContactProfile(
        contact,
        {
          newsletterStatus: NewsletterStatus.Subscribed,
          newsletterGroups: newsletter.groups
        },
        { mergeGroups: true }
      );
    }

    if (callout.mcMergeField && callout.pollMergeField) {
      const [slideId, answerKey] = callout.pollMergeField.split(".");
      await NewsletterService.updateContactFields(contact, {
        [callout.mcMergeField]: answers[slideId]?.[answerKey]?.toString() || ""
      });
    }

    return savedResponse;
  }

  /**
   * Creates a guest response for the given callout
   * @param callout The callout
   * @param guestName The guest's name or undefined for an anonymous response
   * @param guestEmail The guest's email or undefined for an anonymous response
   * @param answers The response answers
   * @returns The new callout response
   */
  async setGuestResponse(
    callout: Callout,
    guest: CalloutResponseGuestData | undefined,
    answers: CalloutResponseAnswersSlide,
    newsletter: CalloutResponseNewsletterData | undefined
  ): Promise<CalloutResponse> {
    if (callout.access === CalloutAccess.Guest && !guest) {
      throw new InvalidCalloutResponse("guest-fields-missing");
    } else if (callout.access === CalloutAccess.OnlyAnonymous && guest) {
      throw new InvalidCalloutResponse("only-anonymous");
    } else if (!callout.active || callout.access === CalloutAccess.Member) {
      throw new InvalidCalloutResponse("closed");
    }

    if (guest) {
      guest.email = normalizeEmailAddress(guest.email);

      let contact = await ContactsService.findOneBy({ email: guest.email });

      // Create a contact if it doesn't exist
      if (!contact) {
        contact = await ContactsService.createContact(guest);
      }

      const response = await this.setResponse(
        callout,
        contact,
        answers,
        newsletter
      );

      // Let the contact know in case it wasn't them
      const title = await this.getCalloutTitle(callout);
      await EmailService.sendTemplateToContact(
        "confirm-callout-response",
        contact,
        { calloutTitle: title, calloutSlug: callout.slug }
      );

      return response;
    } else {
      const response = new CalloutResponse();
      response.callout = callout;
      response.answers = answers;

      return await this.saveResponse(response);
    }
  }

  /**
   * Permanently delete or disassociate a contact's callout data
   * @param contact
   */
  public async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info("Permanently delete callout data for contact " + contact.id);

    await getRepository(CalloutReviewer).delete({ contactId: contact.id });
    await getRepository(CalloutResponseComment).delete({
      contactId: contact.id
    });
    await getRepository(CalloutResponse).update(
      { contactId: contact.id },
      { contactId: null }
    );

    await getRepository(CalloutResponse).update(
      { assigneeId: contact.id },
      { assigneeId: null }
    );
  }

  /**
   * Saves a callout and it's variants, handling duplicate slug errors
   * @param data
   * @returns The data
   */
  private async saveCallout(
    data: Partial<CreateCalloutData>,
    id?: string
  ): Promise<string> {
    const { formSchema, variants, ...calloutData } = data;

    // For some reason GetCalloutFormSchema isn't compatible with
    // QueryDeepPartialEntity<GetCalloutFormSchema> so we force it
    const fixedData = {
      ...calloutData,
      ...(formSchema && {
        formSchema: formSchema as QueryDeepPartialEntity<GetCalloutFormSchema>
      })
    };

    return await runTransaction(async (em) => {
      let newId = id;
      try {
        if (newId) {
          const result = await em
            .getRepository(Callout)
            .update(newId, fixedData);
          if (result.affected === 0) {
            throw new NotFoundError();
          }
        } else {
          const result = await em.getRepository(Callout).insert(fixedData);
          newId = result.identifiers[0].id as string;
        }
      } catch (err) {
        throw isDuplicateIndex(err, "slug")
          ? new DuplicateId(data.slug || "") // Slug can't actually be undefined here
          : err;
      }

      if (variants) {
        await em.getRepository(CalloutVariant).delete({ calloutId: newId });
        await em.getRepository(CalloutVariant).insert(
          Object.entries(variants).map(([name, variant]) => ({
            ...variant,
            name,
            calloutId: newId
          }))
        );
      }

      log.info("Saved callout " + newId);

      return newId;
    });
  }

  /**
   * Handles saving the response, ensuring the number is unique and probably sequential
   * @param response The response to save
   * @returns The updated response
   */
  private async saveResponse(
    response: CalloutResponse
  ): Promise<CalloutResponse> {
    if (!response.number) {
      const lastResponse = await getRepository(CalloutResponse).findOne({
        where: { calloutId: response.callout.id },
        order: { number: "DESC" },
        select: { number: true }
      });

      response.number = lastResponse ? lastResponse.number + 1 : 1;
    }

    try {
      const savedResponse = await getRepository(CalloutResponse).save(response);

      await EmailService.sendTemplateToAdmin("new-callout-response", {
        calloutSlug: response.callout.slug,
        calloutTitle: await this.getCalloutTitle(response.callout),
        responderName:
          response.contact?.fullname || response.guestName || "Anonymous"
      });

      return savedResponse;
    } catch (error) {
      if (isDuplicateIndex(error)) {
        response.number = 0;
        return await this.saveResponse(response);
      } else {
        throw error;
      }
    }
  }

  /**
   * Return the default callout title, fetching it if it's not already available
   * @param callout The callout
   * @returns Callout title
   */
  private async getCalloutTitle(callout: Callout): Promise<string> {
    const defaultVariant =
      callout.variants?.find((v) => v.name === "default") ||
      (await getRepository(CalloutVariant).findOneByOrFail({
        calloutId: callout.id,
        name: "default"
      }));

    // Store for future use
    callout.variants = [...(callout.variants || []), defaultVariant];

    return defaultVariant.title;
  }
}

export const calloutsService = new CalloutsService();
export default calloutsService;
