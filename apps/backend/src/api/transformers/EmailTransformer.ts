import {
  EmailFilterName,
  PaginatedQuery,
  RuleGroup,
  emailFilters,
} from '@beabee/beabee-common';
import { Email } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { GetEmailDto, ListEmailsDto } from '@api/dto/EmailDto';
import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import { BaseTransformer } from './BaseTransformer';

class EmailTransformer extends BaseTransformer<
  Email,
  GetEmailDto,
  EmailFilterName,
  unknown,
  ListEmailsDto & PaginatedQuery
> {
  protected model = Email;
  protected filters = emailFilters;

  /**
   * Convert email to DTO with full metadata
   * @param email Email entity
   * @param auth Authentication info
   * @returns Email DTO with metadata
   */
  @TransformPlainToInstance(GetEmailDto)
  convert(email: Email, auth: AuthInfo): GetEmailDto {
    return {
      id: email.id,
      ...(email.templateId && { templateId: email.templateId }),
      name: email.name,
      fromName: email.fromName,
      fromEmail: email.fromEmail,
      subject: email.subject,
      body: email.body,
      date: email.date.toISOString(),
      mailingCount: email.mailingCount || 0,
    };
  }

  protected transformQuery<T extends ListEmailsDto & PaginatedQuery>(
    query: T
  ): T {
    // Set default sort to date DESC if not specified
    const transformedQuery = {
      ...query,
      sort: query.sort || 'date',
      order: query.order || 'DESC',
    };

    // Add default filter for custom emails (templateId is null) if not already specified
    const hasTemplateIdFilter = query.rules
      ? this.hasTemplateIdFilter(query.rules)
      : false;

    if (!hasTemplateIdFilter) {
      transformedQuery.rules = {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          {
            field: 'templateId',
            operator: 'is_empty',
            value: [],
          },
        ],
      } satisfies RuleGroup;
    }

    return transformedQuery as T;
  }

  private hasTemplateIdFilter(rules: RuleGroup): boolean {
    return rules.rules.some((rule) => {
      if ('rules' in rule) {
        return this.hasTemplateIdFilter(rule);
      }
      return rule.field === 'templateId';
    });
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Email>,
    fieldPrefix: string,
    query: ListEmailsDto & PaginatedQuery,
    auth: AuthInfo,
    operation: 'read' | 'update' | 'delete'
  ): void {
    // Load mailing count relation
    qb.loadRelationCountAndMap(
      `${fieldPrefix}mailingCount`,
      `${fieldPrefix}mailings`
    );
  }
}

export default new EmailTransformer();
