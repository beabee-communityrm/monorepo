import {
  Rule,
  getCalloutComponents,
  stringifyAnswer,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { NotFoundError } from '@beabee/core/errors';
import {
  Callout,
  CalloutResponse,
  CalloutResponseComment,
} from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';
import { groupBy } from '@beabee/core/utils/objects';

import { GetExportQuery } from '#api/dto/BaseDto';
import {
  ExportCalloutResponseDto,
  ExportCalloutResponsesOptsDto,
} from '#api/dto/CalloutResponseDto';
import { BaseCalloutResponseTransformer } from '#api/transformers/BaseCalloutResponseTransformer';
import { getReviewerRules } from '#api/utils';
import { TransformerOperation } from '#type/transformer-operation';
import { stringify } from 'csv-stringify/sync';
import { format } from 'date-fns';
import { In, SelectQueryBuilder } from 'typeorm';

class CalloutResponseExporter extends BaseCalloutResponseTransformer<
  ExportCalloutResponseDto,
  ExportCalloutResponsesOptsDto
> {
  convert(
    response: CalloutResponse,
    auth: AuthInfo,
    opts: ExportCalloutResponsesOptsDto
  ): ExportCalloutResponseDto {
    const contact: [string, string, string, string] = response.contact
      ? [
          response.contact.firstname,
          response.contact.lastname,
          response.contact.fullname,
          response.contact.email,
        ]
      : ['', '', response.guestName || '', response.guestEmail || ''];

    return [
      response.createdAt.toISOString(),
      response.number,
      response.bucket,
      response.tags.map((rt) => rt.tag.name).join(', '),
      response.assignee?.email || '',
      ...contact,
      !response.contact,
      response.newsletter?.optIn ? true : '',
      response.newsletter?.groups.join(',') || '',
      response.comments?.map(commentText).join(', ') || '',
      ...opts.components.map((c) =>
        stringifyAnswer(c, response.answers[c.slideId]?.[c.key])
      ),
    ];
  }

  protected async getNonAdminAuthRules(auth: AuthInfo): Promise<Rule[]> {
    return await getReviewerRules(auth.contact, 'calloutId', false);
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<CalloutResponse>,
    fieldPrefix: string
  ): void {
    qb.orderBy(`${fieldPrefix}createdAt`, 'ASC');
    qb.leftJoinAndSelect(`${fieldPrefix}assignee`, 'assignee');
    qb.leftJoinAndSelect(`${fieldPrefix}contact`, 'contact');
    qb.leftJoinAndSelect(`${fieldPrefix}tags`, 'tags');
    qb.leftJoinAndSelect('tags.tag', 'tag');
  }

  protected async modifyItems(responses: CalloutResponse[]): Promise<void> {
    const comments = await getRepository(CalloutResponseComment).find({
      where: { responseId: In(responses.map((r) => r.id)) },
      relations: { contact: true },
      order: { createdAt: 'ASC' },
    });

    const commentsByResponseId = groupBy(comments, (c) => c.responseId);

    for (const response of responses) {
      const responseComments = commentsByResponseId[response.id];
      if (responseComments) {
        response.comments = responseComments;
      }
    }
  }

  async export(
    auth: AuthInfo,
    calloutId: string,
    query: GetExportQuery
  ): Promise<[string, string]> {
    const callout = await getRepository(Callout).findOneBy({
      id: calloutId,
    });
    if (!callout) {
      throw new NotFoundError();
    }

    const components = getCalloutComponents(callout.formSchema).filter(
      (c) => c.input
    );

    const result = await this.fetch(auth, {
      limit: -1,
      ...query,
      callout,
      // Store components to avoid having to flatten them in convert()
      components,
    });

    const exportName = `responses-${
      callout.slug
    }_${new Date().toISOString()}.csv`;

    const headers = [
      'Date',
      'Number',
      'Bucket',
      'Tags',
      'Assignee',
      'FirstName',
      'LastName',
      'FullName',
      'EmailAddress',
      'IsGuest',
      'NewsletterOptIn',
      'NewsletterGroups',
      'Comments',
      ...components.map((c) => c.label || c.key),
    ];

    return [
      exportName,
      stringify([headers, ...result.items], {
        cast: { date: (d) => d.toISOString() },
      }),
    ];
  }
}

function commentText(comment: CalloutResponseComment) {
  const date = format(comment.createdAt, 'Pp');
  return `${comment.contact.fullname} (${date}): ${comment.text}`;
}

export default new CalloutResponseExporter();
