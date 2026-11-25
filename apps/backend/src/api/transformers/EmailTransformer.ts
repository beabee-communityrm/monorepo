import { EmailFilterName, emailFilters } from '@beabee/beabee-common';
import { Email, EmailMailing } from '@beabee/core/models';
import { countRelatedByParentId } from '@beabee/core/utils/relation-count';

import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import { GetEmailDto, ListEmailsDto } from '#api/dto/EmailDto';

import { BaseTransformer } from './BaseTransformer.js';

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
    const ongoingEmail = email.ongoingEmail;
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
      isOngoing: !!ongoingEmail,
      ...(ongoingEmail && {
        segmentId: ongoingEmail.segmentId,
        segmentName: ongoingEmail.segment?.name,
        trigger: ongoingEmail.trigger,
        enabled: ongoingEmail.enabled,
      }),
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Email>,
    fieldPrefix: string
  ): void {
    // Load ongoing email with segment for detail data
    qb.leftJoinAndSelect(
      `${fieldPrefix}ongoingEmail`,
      'ongoingEmail'
    ).leftJoinAndSelect('ongoingEmail.segment', 'ongoingSegment');
  }

  protected async modifyItems(emails: Email[]): Promise<void> {
    const mailingCounts = await countRelatedByParentId(
      EmailMailing,
      'emailId',
      emails.map((e) => e.id)
    );
    for (const email of emails) {
      email.mailingCount = mailingCounts.get(email.id) ?? 0;
    }
  }
}

export default new EmailTransformer();
