import {
  PaginatedQuery,
  Rule,
  calloutVariantFilters,
} from '@beabee/beabee-common';
import { CalloutVariant } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { CalloutVariantDto } from '@api/dto/CalloutVariantDto';
import { canCreateForCallout, getReviewerRules } from '@api/utils';
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
      responseLinkText: variant.responseLinkText,
      responseEmailSubject: variant.responseEmailSubject,
      responseEmailBody: variant.responseEmailBody,
    };
  }

  protected async canCreate(
    auth: AuthInfo,
    data: Partial<CalloutVariant>[]
  ): Promise<boolean> {
    return await canCreateForCallout(auth, data);
  }

  protected async getNonAdminAuthRules(
    auth: AuthInfo,
    query: PaginatedQuery,
    operation: TransformerOperation
  ): Promise<Rule[]> {
    return await getReviewerRules(
      auth.contact,
      'calloutId',
      // Reviewers with edit permission can create, update or delete variants
      operation !== 'read'
    );
  }
}

export default new CalloutVariantTransformer();
