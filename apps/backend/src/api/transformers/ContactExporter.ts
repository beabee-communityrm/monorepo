import { RoleType } from '@beabee/beabee-common';
import { Contact } from '@beabee/core/models';
import { getMembershipStatus } from '@beabee/core/services/PaymentService';
import { AuthInfo } from '@beabee/core/type';

import { GetExportQuery } from '@api/dto/BaseDto';
import { ExportContactDto } from '@api/dto/ContactDto';
import { stringify } from 'csv-stringify/sync';
import { SelectQueryBuilder } from 'typeorm';

import { BaseContactTransformer } from './BaseContactTransformer';

class ContactExporter extends BaseContactTransformer<
  ExportContactDto,
  GetExportQuery
> {
  convert(contact: Contact): ExportContactDto {
    const tagNames =
      contact.tags?.map((assignment) => assignment.tag.name) || [];

    return {
      Id: contact.id,
      EmailAddress: contact.email,
      FirstName: contact.firstname,
      LastName: contact.lastname,
      Joined: contact.joined.toISOString(),
      Tags: tagNames.join(', '),
      ContributionType: contact.contributionType,
      ContributionMonthlyAmount: contact.contributionMonthlyAmount,
      ContributionPeriod: contact.contributionPeriod,
      ContributionDescription: contact.contributionDescription,
      ContributionCancelled:
        contact.contribution.cancelledAt?.toISOString() || '',
      MembershipStarts: contact.membership?.dateAdded.toISOString() || '',
      MembershipExpires: contact.membership?.dateExpires?.toISOString() || '',
      MembershipStatus: getMembershipStatus(contact),
      NewsletterStatus: contact.profile.newsletterStatus,
      DeliveryOptIn: contact.profile.deliveryOptIn,
      DeliveryAddressLine1: contact.profile.deliveryAddress?.line1 || '',
      DeliveryAddressLine2: contact.profile.deliveryAddress?.line2 || '',
      DeliveryAddressCity: contact.profile.deliveryAddress?.city || '',
      DeliveryAddressPostcode: contact.profile.deliveryAddress?.postcode || '',
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Contact>,
    fieldPrefix: string
  ): void {
    qb.orderBy(`${fieldPrefix}joined`);
    qb.leftJoinAndSelect(`${fieldPrefix}roles`, 'roles');
    qb.leftJoinAndSelect(`${fieldPrefix}profile`, 'profile');
    qb.leftJoinAndSelect(`${fieldPrefix}contribution`, 'contribution');
    qb.leftJoinAndSelect(
      `${fieldPrefix}tags`,
      'tagAssignments'
    ).leftJoinAndSelect('tagAssignments.tag', 'tag');
  }

  async export(
    auth: AuthInfo,
    query?: GetExportQuery
  ): Promise<[string, string]> {
    const result = await this.fetch(auth, { limit: -1, ...query });

    const exportName = `contacts-${new Date().toISOString()}.csv`;
    return [exportName, stringify(result.items, { header: true })];
  }
}

export default new ContactExporter();
