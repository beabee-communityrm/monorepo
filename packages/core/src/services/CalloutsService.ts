import {
  CalloutAccess,
  CalloutResponseAnswersSlide,
  CalloutResponseGuestData,
  CalloutResponseNewsletterData,
  CreateCalloutData,
  FormioFile,
  GetCalloutFormSchema,
  NewsletterStatus,
  UpdateCalloutData,
  isFileUploadAnswer,
} from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';
import slugify from 'slugify';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 as uuidv4 } from 'uuid';

import config from '#config/config';
import { contactEmailTemplates } from '#data/email-templates';
import { getRepository, runTransaction } from '#database';
import {
  DuplicateId,
  InvalidCalloutResponse,
  NotFoundError,
} from '#errors/index';
import { log as mainLogger } from '#logging';
import {
  Callout,
  CalloutResponse,
  CalloutResponseComment,
  CalloutResponseTag,
  CalloutReviewer,
  CalloutTag,
  CalloutVariant,
  Contact,
} from '#models/index';
import ContactsService from '#services/ContactsService';
import EmailService from '#services/EmailService';
import NewsletterService from '#services/NewsletterService';
import OptionsService from '#services/OptionsService';
import { isDuplicateIndex } from '#utils/db';
import { normalizeEmailAddress } from '#utils/email';

const log = mainLogger.child({ app: 'callouts-service' });

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
    const baseSlug =
      data.slug || slugify(data.variants.default.title, { lower: true });

    while (true) {
      const slug = baseSlug + (autoSlug ? '-' + autoSlug : '');
      log.info('Creating callout with slug ' + slug);
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
   * List all callouts with minimal information
   * This method should NOT be used in controllers, use CalloutTransformer instead
   * @returns Array of callouts with id, slug, and image fields
   * @deprecated Deprecated from the start, as we only need this for the uploads migration script
   */
  async listCallouts(): Promise<
    Array<{ id: string; slug: string; image: string }>
  > {
    log.info('Listing all callouts for migration purposes');
    const callouts = await getRepository(Callout).find({
      select: ['id', 'slug', 'image'],
    });

    return callouts;
  }

  /**
   * Update a callout
   * @param id The callout ID
   * @param data The new callout data
   * @returns The updated callout
   */
  async updateCallout(id: string, data: UpdateCalloutData): Promise<void> {
    log.info('Updating callout ' + id);
    // Prevent the join survey from being made inactive
    if (OptionsService.getText('join-survey') === id) {
      if (data.expires) {
        throw new BadRequestError(
          'Cannot set an expiry date on the join survey'
        );
      } else if (data.starts === null) {
        throw new BadRequestError('Cannot set join survey to draft');
      } else if (data.starts && data.starts > new Date()) {
        throw new BadRequestError('Cannot set join survey to scheduled');
      }
    }

    await this.saveCallout(data, id);
  }

  async duplicateCallout(id: string): Promise<string> {
    const callout = await getRepository(Callout).findOne({
      where: { id },
      relations: { variants: true, tags: true },
    });
    if (!callout) {
      throw new NotFoundError();
    }

    const { id: removeId, tags, variants, ...newCalloutData } = callout;

    const newCalloutVariants = Object.fromEntries(
      variants.map((variant) => {
        const { id: removeVariantId, ...variantData } = variant;
        return [variant.name, variantData];
      })
    );

    const newCallout = {
      ...newCalloutData,
      variants: {
        default: newCalloutVariants.default,
        ...newCalloutVariants,
      },
    };

    const newId = await this.createCallout(newCallout, 0);

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
    log.info('Deleting callout ' + id);

    return await runTransaction(async (em) => {
      await em
        .createQueryBuilder()
        .delete()
        .from(CalloutResponseComment)
        .where((qb) => {
          const subQuery = em
            .createQueryBuilder()
            .subQuery()
            .select('id')
            .from(CalloutResponse, 'cr')
            .where('cr.calloutId = :id');
          qb.where('responseId IN ' + subQuery.getQuery());
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
            .select('id')
            .from(CalloutResponse, 'cr')
            .where('cr.calloutId = :id');
          qb.where('responseId IN ' + subQuery.getQuery());
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
        contactId: contact.id,
      },
      // Get most recent response for callouts with allowMultiple
      order: { createdAt: 'DESC' },
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
      throw new InvalidCalloutResponse('only-anonymous');
    } else if (
      !contact.membership?.isActive &&
      callout.access === CalloutAccess.Member
    ) {
      throw new InvalidCalloutResponse('expired-user');
    } else if (!callout.active) {
      throw new InvalidCalloutResponse('closed');
    }

    let response = await this.getResponse(callout, contact);
    if (!response || callout.allowMultiple) {
      response = new CalloutResponse();
      response.callout = callout;
      response.contact = contact;
    } else if (!callout.allowUpdate) {
      throw new InvalidCalloutResponse('cant-update');
    }

    response.answers = answers;
    response.newsletter = newsletter || null;

    const savedResponse = await this.saveResponse(response);

    if (newsletter?.optIn) {
      log.info(`Opting contact ${contact.id} into newsletter`, { newsletter });
      await ContactsService.updateContactProfile(
        contact,
        {
          newsletterStatus: NewsletterStatus.Pending,
          newsletterGroups: newsletter.groups,
        },
        { mergeGroups: true }
      );
    }

    if (callout.mcMergeField && callout.pollMergeField) {
      const [slideId, answerKey] = callout.pollMergeField.split('.');
      await NewsletterService.updateContactFields(contact, {
        [callout.mcMergeField]: answers[slideId]?.[answerKey]?.toString() || '',
      });
    }

    // Send confirmation email to the contact
    await this.sendResponseEmail(callout, contact);

    return savedResponse;
  }

  /**
   * Creates a guest response for the given callout
   * @param callout The callout
   * @param guestName The guest's name or undefined for an anonymous response
   * @param guestEmail The guest's email or undefined for an anonymous response
   * @param answers The response answers
   * @returns The new callout response ID
   */
  async setGuestResponse(
    callout: Callout,
    guest: CalloutResponseGuestData | undefined,
    answers: CalloutResponseAnswersSlide,
    newsletter: CalloutResponseNewsletterData | undefined
  ): Promise<string> {
    if (callout.access === CalloutAccess.Guest && !guest) {
      throw new InvalidCalloutResponse('guest-fields-missing');
    } else if (callout.access === CalloutAccess.OnlyAnonymous && guest) {
      throw new InvalidCalloutResponse('only-anonymous');
    } else if (!callout.active || callout.access === CalloutAccess.Member) {
      throw new InvalidCalloutResponse('closed');
    }

    if (guest) {
      guest.email = normalizeEmailAddress(guest.email);

      let contact = await ContactsService.findOneBy({ email: guest.email });

      if (contact) {
        log.info(
          'Found existing contact for callout response with email ' +
            guest.email
        );
      } else {
        log.info(
          'Creating new contact for callout response with email ' + guest.email
        );
        contact = await ContactsService.createContact(guest);
      }

      try {
        const response = await this.setResponse(
          callout,
          contact,
          answers,
          newsletter
        );

        return response.id;
      } catch (err) {
        // Suppress errors from creating a response for a contact, this prevents
        // any potential information leaking about failures related to some
        // state of the contact
        if (err instanceof InvalidCalloutResponse) {
          return uuidv4();
        } else {
          throw err;
        }
      }
    } else {
      log.info('Creating anonymous callout response for callout ' + callout.id);

      const response = new CalloutResponse();
      response.callout = callout;
      response.answers = answers;

      const savedResponse = await this.saveResponse(response);
      return savedResponse.id;
    }
  }

  /**
   * Permanently delete or disassociate a contact's callout data
   * @param contact
   */
  public async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info('Permanently delete callout data for contact ' + contact.id);

    await getRepository(CalloutReviewer).delete({ contactId: contact.id });
    await getRepository(CalloutResponseComment).delete({
      contactId: contact.id,
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
    data: UpdateCalloutData,
    id?: string
  ): Promise<string> {
    const { formSchema, variants, ...calloutData } = data;

    // For some reason GetCalloutFormSchema isn't compatible with
    // QueryDeepPartialEntity<GetCalloutFormSchema> so we force it
    const fixedData = {
      ...calloutData,
      ...(formSchema && {
        formSchema: formSchema as QueryDeepPartialEntity<GetCalloutFormSchema>,
      }),
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
        throw isDuplicateIndex(err, 'slug')
          ? new DuplicateId(data.slug || '') // Slug can't actually be undefined here
          : err;
      }

      if (variants) {
        await em.getRepository(CalloutVariant).delete({ calloutId: newId });
        await em.getRepository(CalloutVariant).insert(
          Object.entries(variants).map(([name, variant]) => ({
            ...variant,
            name,
            calloutId: newId,
          }))
        );
      }

      log.info('Saved callout ' + newId);

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
        order: { number: 'DESC' },
        select: { number: true },
      });

      response.number = lastResponse ? lastResponse.number + 1 : 1;
    }

    try {
      const savedResponse = await getRepository(CalloutResponse).save(response);

      log.info(
        `Saved callout response ${response.number} for callout ${response.callout.id}`
      );

      await EmailService.sendTemplateToAdmin('new-callout-response', {
        calloutSlug: response.callout.slug,
        calloutTitle: await this.getCalloutTitle(response.callout),
        responderName:
          response.contact?.fullname || response.guestName || 'Anonymous',
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
    const defaultVariant = await this.getDefaultVariant(callout);
    return defaultVariant.title;
  }

  /**
   * Get the default variant for a callout, fetching it if it's not already available
   * @param callout The callout
   * @returns Default variant
   */
  private async getDefaultVariant(callout: Callout): Promise<CalloutVariant> {
    const defaultVariant =
      callout.variants?.find((v) => v.name === 'default') ||
      (await getRepository(CalloutVariant).findOneByOrFail({
        calloutId: callout.id,
        name: 'default',
      }));

    // Store for future use
    if (!callout.variants?.some((v) => v.name === 'default')) {
      callout.variants = [...(callout.variants || []), defaultVariant];
    }

    return defaultVariant;
  }

  /**
   * Send a response confirmation email to a contact
   * Only sends email if custom email is enabled and configured
   * @param callout The callout
   * @param contact The contact to send the email to
   */
  private async sendResponseEmail(
    callout: Callout,
    contact: Contact
  ): Promise<void> {
    // Only send email if custom email is enabled and configured
    if (!callout.sendResponseEmail) {
      return;
    }

    const variant = await this.getDefaultVariant(callout);

    // Check if custom subject and body are configured
    if (!variant.responseEmailSubject || !variant.responseEmailBody) {
      log.warn(
        `Callout ${callout.id} has sendResponseEmail enabled but no email content configured`
      );
      return;
    }

    await EmailService.sendCustomEmailToContact(
      contact,
      variant.responseEmailSubject,
      variant.responseEmailBody,
      {
        mergeFields: contactEmailTemplates['callout-response-answers'].fn(
          contact,
          {
            calloutSlug: callout.slug,
            calloutTitle: variant.title,
          }
        ),
      }
    );
  }

  /**
   * List all callout responses that contain a file upload
   * This method should NOT be used in controllers, use CalloutResponseTransformer instead
   * @returns Array of callout responses with file uploads
   */
  async listResponsesWithFileUploads(): Promise<
    Array<{
      id: string;
      calloutId: string;
      answers: CalloutResponseAnswersSlide;
    }>
  > {
    log.info(
      'Listing all callout responses with file uploads for migration purposes'
    );

    // Get all responses
    const responses = await getRepository(CalloutResponse).find({
      select: ['id', 'calloutId', 'answers'],
    });

    // Filter responses with file uploads
    return responses.filter((response) => {
      // Iterate through each slide's answers
      for (const slideId in response.answers) {
        const slideAnswers = response.answers[slideId];
        if (!slideAnswers) continue; // Skip empty slides instead of rejecting entire response

        // Iterate through each component's answer in the slide
        for (const componentKey in slideAnswers) {
          const answer = slideAnswers[componentKey];

          if (!answer) continue; // Skip empty answers instead of rejecting entire response

          // Check if the answer or any item in an array of answers contains a file upload
          if (Array.isArray(answer)) {
            // If it's an array of answers, check each one
            for (const item of answer) {
              if (isFileUploadAnswer(item)) return true;
            }
          } else if (isFileUploadAnswer(answer)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  /**
   * Update a document URL in a callout response
   * @param responseId The response ID
   * @param slideId The slide ID containing the document
   * @param componentKey The component key containing the document
   * @param arrayIndex Optional index if the answer is in an array, or null if it's a direct answer
   * @param newUrl The new document URL
   * @returns True if the update was successful
   * @deprecated Deprecated from the start, as we only need this for the uploads migration script
   */
  async updateResponseFileUploadUrl(
    responseId: string,
    slideId: string,
    componentKey: string,
    arrayIndex: number | null,
    newFileUpload: FormioFile
  ): Promise<boolean> {
    log.info(`Updating document URL in response ${responseId}`);

    const response = await getRepository(CalloutResponse).findOne({
      where: { id: responseId },
      select: ['id', 'answers'],
    });

    if (!response) {
      log.warn(`Response ${responseId} not found`);
      return false;
    }

    const slideAnswers = response.answers[slideId];
    if (!slideAnswers) {
      log.warn(`Slide ${slideId} not found in response ${responseId}`);
      return false;
    }

    const answer = slideAnswers[componentKey];
    if (!answer) {
      log.warn(`Component ${componentKey} not found in slide ${slideId}`);
      return false;
    }

    // Update the URL
    if (arrayIndex !== null && Array.isArray(answer)) {
      // Update an item in an array
      if (arrayIndex < 0 || arrayIndex >= answer.length) {
        log.warn(`Array index ${arrayIndex} out of bounds`);
        return false;
      }

      const item = answer[arrayIndex];
      if (!isFileUploadAnswer(item)) {
        log.warn(`Item at index ${arrayIndex} is not a file upload`);
        return false;
      }

      answer[arrayIndex] = newFileUpload;
    } else if (!Array.isArray(answer) && isFileUploadAnswer(answer)) {
      // Update a direct answer
      slideAnswers[componentKey] = newFileUpload;
    } else {
      log.warn(`Answer is not a file upload`);
      return false;
    }

    // Save the updated response
    await getRepository(CalloutResponse).update(responseId, {
      answers: response.answers,
    });

    log.info(`Successfully updated document URL in response ${responseId}`);
    return true;
  }
}

export const calloutsService = new CalloutsService();
export default calloutsService;
