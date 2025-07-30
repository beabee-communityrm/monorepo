import {
  CalloutTagFilterName,
  Filters,
  RuleGroup,
  calloutTagFilters,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import {
  CalloutResponseTag,
  CalloutReviewer,
  CalloutTag,
} from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { GetCalloutTagDto } from '@api/dto';
import { getReviewerRules } from '@api/utils/callouts';
import { BadRequestError, UnauthorizedError } from 'routing-controllers';

import BaseTagTransformer from './BaseTagTransformer';

class CalloutTagTransformer extends BaseTagTransformer<
  CalloutTag,
  GetCalloutTagDto,
  CalloutTagFilterName
> {
  protected model = CalloutTag;
  protected filters: Filters<CalloutTagFilterName> = calloutTagFilters;
  protected dtoType = GetCalloutTagDto;
  protected assignmentModel = CalloutResponseTag;
  protected entityIdField = 'responseId';

  protected async getNonAdminAuthRules(
    auth: AuthInfo
  ): Promise<RuleGroup | false> {
    const reviewerRules = await getReviewerRules(auth.contact, 'calloutId');
    if (reviewerRules.length) {
      return {
        condition: 'OR',
        rules: reviewerRules,
      };
    }

    return false;
  }

  /**
   * Checks if the user can create a new tag. Callout reviewers can create tags
   * for the callouts they are reviewing.
   *
   * @param auth
   * @param data
   * @returns
   */
  protected async canCreate(
    auth: AuthInfo,
    data: Partial<CalloutTag>
  ): Promise<boolean> {
    if (auth.roles.includes('admin')) {
      return true;
    }

    if (!data.calloutId || !auth.contact) {
      throw new BadRequestError('Callout ID and contact required');
    }

    const reviewer = await getRepository(CalloutReviewer).findOneBy({
      contactId: auth.contact.id,
      calloutId: data.calloutId,
    });

    return !!reviewer;
  }
}

export default new CalloutTagTransformer();
