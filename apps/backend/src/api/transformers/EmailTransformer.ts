import { getRepository } from '@beabee/core/database';
import { Email, SegmentOngoingEmail } from '@beabee/core/models';
import OptionsService from '@beabee/core/services/OptionsService';
import { AuthInfo } from '@beabee/core/type';

import {
  GetEmailDto,
  GetEmailListItemDto,
  ListEmailsDto,
} from '@api/dto/EmailDto';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import { TransformPlainToInstance, plainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import { BaseTransformer } from './BaseTransformer';

/**
 * Transformer for Email models
 * Handles conversion between Email entities and DTOs
 * Supports both detailed email view (GetEmailDto) and list view (GetEmailListItemDto)
 */
class EmailTransformer extends BaseTransformer<
  Email,
  GetEmailDto | GetEmailListItemDto,
  never,
  ListEmailsDto,
  ListEmailsDto
> {
  protected model = Email;
  protected filters = {};

  /**
   * Convert Email entity to DTO
   * Returns GetEmailDto for detailed view or GetEmailListItemDto for list view
   */
  convert(email: Email, auth: AuthInfo, opts?: ListEmailsDto): GetEmailDto {
    // Check if this email is a system template override
    const systemEmailMappings = OptionsService.getJSON('email-templates') || {};
    const systemEmailIds = Object.values(systemEmailMappings) as string[];
    const isSystem = systemEmailIds.includes(email.id);

    // Find the system template ID for this email (reverse lookup)
    const systemTemplateId = isSystem
      ? Object.keys(systemEmailMappings).find(
          (templateId) => systemEmailMappings[templateId] === email.id
        )
      : undefined;

    const dto = plainToInstance(GetEmailDto, {
      id: email.id,
      name: email.name,
      subject: email.subject,
      body: email.body,
      date: email.date.toISOString(),
      isSystem,
      systemTemplateId,
    });

    return dto;
  }

  /**
   * Convert Email entity to list item DTO
   * Includes additional metadata like mailing count and system/segment flags
   */
  convertToListItem(email: Email): GetEmailListItemDto {
    return plainToInstance(GetEmailListItemDto, {
      id: email.id,
      name: email.name,
      subject: email.subject,
      date: email.date.toISOString(),
      mailingCount: (email.mailingCount as number) || 0,
      isSystem: (email as any).isSystem || false,
      isSegment: (email as any).isSegment || false,
    });
  }

  /**
   * Modify query builder to load mailing count
   */
  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Email>,
    fieldPrefix: string,
    query: ListEmailsDto,
    auth: AuthInfo
  ): void {
    // Load mailing count for list view
    qb.loadRelationCountAndMap(
      `${fieldPrefix}mailingCount`,
      `${fieldPrefix}mailings`
    );
  }

  /**
   * Modify items after fetch to add system and segment flags
   */
  protected async modifyItems(
    emails: Email[],
    query: ListEmailsDto,
    auth: AuthInfo
  ): Promise<void> {
    if (emails.length === 0) {
      return;
    }

    // Get system email template mappings
    const systemEmailMappings = OptionsService.getJSON('email-templates') || {};
    const systemEmailIds = Object.values(systemEmailMappings) as string[];

    // Get segment email mappings
    const segmentEmails = await getRepository(SegmentOngoingEmail).find();
    const segmentEmailIds = segmentEmails.map((se) => se.emailId);

    // Add flags to each email
    for (const email of emails) {
      (email as any).isSystem = systemEmailIds.includes(email.id);
      (email as any).isSegment = segmentEmailIds.includes(email.id);
    }
  }

  /**
   * Fetch emails for list view with pagination
   * Returns GetEmailListItemDto with additional metadata
   */
  async fetchList(
    auth: AuthInfo,
    query: ListEmailsDto
  ): Promise<PaginatedDto<GetEmailListItemDto>> {
    const {
      items,
      total,
      query: finalQuery,
      offset,
    } = await this.fetchRaw(auth, query);

    return plainToInstance(PaginatedDto<GetEmailListItemDto>, {
      total,
      offset,
      count: items.length,
      items: items.map((item) => this.convertToListItem(item)),
    });
  }
}

export default new EmailTransformer();
