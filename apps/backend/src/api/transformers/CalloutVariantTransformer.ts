import {
  PaginatedQuery,
  RuleGroup,
  calloutVariantFilters,
} from '@beabee/beabee-common';
import { CalloutVariant } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { CalloutVariantDto } from '@api/dto/CalloutVariantDto';
import { getReviewerRules } from '@api/utils';
import { TransformerOperation } from '@type/transformer-operation';
import { TransformPlainToInstance } from 'class-transformer';

import { BaseTransformer } from './BaseTransformer';

class CalloutVariantTransformer extends BaseTransformer<
  CalloutVariant,
  CalloutVariantDto
> {
  protected model = CalloutVariant;
  protected filters = calloutVariantFilters;

  @TransformPlainToInstance(CalloutVariantDto)
  convert(variant: CalloutVariant): CalloutVariantDto {
    return {
      title: variant.title,
      excerpt: variant.excerpt,
      intro: variant.intro,
      thanksTitle: variant.thanksTitle,
      thanksText: variant.thanksText,
      thanksRedirect: variant.thanksRedirect,
      shareTitle: variant.shareTitle,
      shareDescription: variant.shareDescription,
      slideNavigation: variant.slideNavigation,
      componentText: variant.componentText,
    };
  }

  protected async getNonAdminAuthRules(
    auth: AuthInfo,
    query: PaginatedQuery,
    operation: TransformerOperation
  ): Promise<RuleGroup | false> {
    const reviewerRules = await getReviewerRules(auth.contact, 'calloutId');
    // Not a reviewer, can only read callouts
    if (reviewerRules.length === 0 && operation !== 'read') {
      return false;
    }
    return {
      condition: 'OR',
      rules: reviewerRules,
    };
  }
}

export default new CalloutVariantTransformer();
