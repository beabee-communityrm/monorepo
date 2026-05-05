import type { CalloutReviewerFilterName, Rule } from '@beabee/beabee-common';
import { calloutReviewerFilters } from '@beabee/beabee-common';
import { CalloutReviewer } from '@beabee/core/models';
import type { AuthInfo } from '@beabee/core/type';

import type { SelectQueryBuilder } from 'typeorm';

import type { GetCalloutReviewerDto } from '#api/dto/CalloutReviewerDto';
import { getReviewerRules } from '#api/utils/callouts';
import type { TransformerOperation } from '#type/transformer-operation';

import { BaseTransformer } from './BaseTransformer.js';
import ContactTransformer, { loadContactRoles } from './ContactTransformer.js';

class CalloutReviewerTransformer extends BaseTransformer<
  CalloutReviewer,
  GetCalloutReviewerDto,
  CalloutReviewerFilterName
> {
  protected model = CalloutReviewer;
  protected filters = calloutReviewerFilters;

  convert(reviewer: CalloutReviewer, auth: AuthInfo): GetCalloutReviewerDto {
    return {
      id: reviewer.id,
      contact: ContactTransformer.convert(reviewer.contact, auth),
      canEdit: reviewer.canEdit,
    };
  }

  protected async getNonAdminAuthRules(
    auth: AuthInfo,
    query: unknown,
    operation: TransformerOperation
  ): Promise<Rule[]> {
    return operation === 'read'
      ? await getReviewerRules(auth.contact, 'calloutId', false)
      : // Only admins can create, updateor delete reviewers
        [];
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<CalloutReviewer>,
    fieldPrefix: string
  ): void {
    qb.innerJoinAndSelect(`${fieldPrefix}contact`, 'contact');
  }

  protected async modifyItems(items: CalloutReviewer[]): Promise<void> {
    await loadContactRoles(items.map((i) => i.contact));
  }
}

export default new CalloutReviewerTransformer();
