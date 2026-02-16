import {
  CalloutTagFilterName,
  Filters,
  Rule,
  calloutTagFilters,
} from '@beabee/beabee-common';
import { CalloutResponseTag, CalloutTag } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { GetCalloutTagDto } from '#api/dto';
import { canCreateForCallout, getReviewerRules } from '#api/utils/callouts';

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

  protected async getNonAdminAuthRules(auth: AuthInfo): Promise<Rule[]> {
    return await getReviewerRules(auth.contact, 'calloutId', false);
  }

  /**
   * Checks if the user can create a new tag. Callout reviewers can create tags
   * for the callouts they are reviewing.
   *
   * @param auth The authentication info
   * @param data The tag data to create
   * @returns True if the user can create the tags, false otherwise
   */
  protected async canCreate(
    auth: AuthInfo,
    data: Partial<CalloutTag>[]
  ): Promise<boolean> {
    return await canCreateForCallout(auth, data);
  }
}

export default new CalloutTagTransformer();
