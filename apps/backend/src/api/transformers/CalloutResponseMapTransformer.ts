import {
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
  CalloutResponseViewSchema,
  Rule,
  getCalloutComponents,
  stringifyAnswer,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { NotFoundError } from '@beabee/core/errors';
import { Callout, CalloutResponse } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import {
  GetCalloutResponseMapDto,
  GetCalloutResponseMapOptsDto,
  ListCalloutResponsesDto,
} from '#api/dto/CalloutResponseDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import { BaseCalloutResponseTransformer } from '#api/transformers/BaseCalloutResponseTransformer';
import { TransformPlainToInstance } from 'class-transformer';

class CalloutResponseMapTransformer extends BaseCalloutResponseTransformer<
  GetCalloutResponseMapDto,
  GetCalloutResponseMapOptsDto
> {
  @TransformPlainToInstance(GetCalloutResponseMapDto)
  convert(
    response: CalloutResponse,
    auth: AuthInfo,
    opts: GetCalloutResponseMapOptsDto
  ): GetCalloutResponseMapDto {
    let title = '',
      images: CalloutResponseAnswer[] = [],
      address: CalloutResponseAnswer | undefined;

    const {
      responseViewSchema: { map, titleProp, imageProp },
      formSchema,
    } = opts.callout;

    const answers: CalloutResponseAnswersSlide = Object.fromEntries(
      formSchema.slides.map((slide) => [slide.id, {}])
    );

    for (const component of getCalloutComponents(formSchema)) {
      // Skip components that shouldn't be displayed publicly
      if (component.adminOnly) {
        continue;
      }

      const answer = response.answers[component.slideId]?.[component.key];
      if (answer) {
        // answers[slideId] will definitely be defined
        answers[component.slideId]![component.key] = answer;
        // Extract title, address and image answers
        if (component.fullKey === titleProp) {
          title = stringifyAnswer(component, answer);
        }
        if (component.fullKey === map?.addressProp) {
          address = Array.isArray(answer) ? answer[0] : answer;
        }
        if (component.fullKey === imageProp && answer) {
          images = Array.isArray(answer) ? answer : [answer];
        }
      }
    }

    return {
      number: response.number,
      answers,
      title,
      photos: images as CalloutResponseAnswerFileUpload[], // TODO: ensure type?
      ...(address && {
        address: address as CalloutResponseAnswerAddress, // TODO: ensure type?
      }),
    };
  }

  protected async getNonAdminAuthRules(
    auth: AuthInfo,
    query: GetCalloutResponseMapOptsDto
  ): Promise<Rule[]> {
    // Only show results from relevant buckets
    return query.callout.responseViewSchema.buckets.map((bucket) => ({
      field: 'bucket',
      operator: 'equal',
      value: [bucket],
    }));
  }

  /**
   * Fetch the responses for a specific callout. The transformer needs the
   * callout's response view schema to determine how to transform the responses.
   *
   * @param auth The authentication info
   * @param calloutId The ID of the callout to fetch responses for
   * @param query The query
   * @returns The paginated responses
   */
  async fetchForCallout(
    auth: AuthInfo,
    calloutId: string,
    query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseMapDto>> {
    const callout = await getRepository(Callout).findOneBy({ id: calloutId });
    if (!callout?.responseViewSchema) {
      throw new NotFoundError();
    }

    const calloutWithSchema = callout as Callout & {
      responseViewSchema: CalloutResponseViewSchema;
    };

    return await this.fetch(auth, {
      ...query,
      callout: calloutWithSchema,
    });
  }
}

export default new CalloutResponseMapTransformer();
