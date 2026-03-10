import { EmailFilterName, emailFilters } from '@beabee/beabee-common';
import { Email } from '@beabee/core/models';

import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import { GetEmailDto, ListEmailsDto } from '#api/dto/EmailDto';

import { BaseTransformer } from './BaseTransformer';

class EmailTransformer extends BaseTransformer<
  Email,
  GetEmailDto,
  EmailFilterName,
  unknown,
  ListEmailsDto
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
  convert(email: Email): GetEmailDto {
    return {
      id: email.id,
      ...(email.templateId && { templateId: email.templateId }),
      name: email.name,
      ...(email.fromName && { fromName: email.fromName }),
      ...(email.fromEmail && { fromEmail: email.fromEmail }),
      subject: email.subject,
      body: email.body,
      date: email.date.toISOString(),
      mailingCount: email.mailingCount || 0,
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Email>,
    fieldPrefix: string
  ): void {
    // Load mailing count relation
    qb.loadRelationCountAndMap(
      `${fieldPrefix}mailingCount`,
      `${fieldPrefix}mailings`
    );
  }
}

export default new EmailTransformer();
