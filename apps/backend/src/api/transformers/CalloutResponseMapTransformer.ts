import {
  CalloutResponseAnswer,
  CalloutResponseAnswerAddress,
  CalloutResponseAnswerFileUpload,
  CalloutResponseAnswersSlide,
  getCalloutComponents,
  stringifyAnswer
} from "@beabee/beabee-common";
import { TransformPlainToInstance } from "class-transformer";

import { getRepository } from "@beabee/core/database";

import {
  GetCalloutResponseMapDto,
  GetCalloutResponseMapOptsDto,
  ListCalloutResponseMapDto,
  ListCalloutResponsesDto
} from "@api/dto/CalloutResponseDto";
import { PaginatedDto } from "@api/dto/PaginatedDto";
import { NotFoundError } from "@beabee/core/errors";
import { BaseCalloutResponseTransformer } from "@api/transformers/BaseCalloutResponseTransformer";
import { mergeRules } from "@api/utils/rules";

import { Callout, CalloutResponse } from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";
import { CalloutResponseViewSchema } from "@type/callout-response-view-schema";

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
    let title = "",
      images: CalloutResponseAnswer[] = [],
      address: CalloutResponseAnswer | undefined;

    const {
      responseViewSchema: { map, titleProp, imageProp },
      formSchema
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
        address: address as CalloutResponseAnswerAddress // TODO: ensure type?
      })
    };
  }

  protected async transformQuery<T extends ListCalloutResponseMapDto>(
    query: T
  ): Promise<T> {
    return {
      ...query,
      rules: mergeRules([
        query.rules,
        // Only show results from relevant buckets
        {
          condition: "OR",
          rules: query.callout.responseViewSchema.buckets.map((bucket) => ({
            field: "bucket",
            operator: "equal",
            value: [bucket]
          }))
        },
        // Only load responses for the given callout
        {
          field: "calloutId",
          operator: "equal",
          value: [query.callout.id]
        }
      ])
    };
  }

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
      // TODO: support pagination in frontend
      limit: 2000
    });
  }
}

export default new CalloutResponseMapTransformer();
