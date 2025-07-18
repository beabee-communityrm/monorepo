import { createQueryBuilder } from '@beabee/core/database';
import { Contact, ContactContribution } from '@beabee/core/models';

import { Brackets, SelectQueryBuilder } from 'typeorm';

import { Param } from '#core/utils/params';

import BaseExport, { ExportResult } from './BaseExport';

export default class ActiveMembersExport extends BaseExport<Contact> {
  exportName = 'Active members export';
  itemStatuses = ['added', 'seeen'];
  itemName = 'active members';
  idColumn = 'm.id';

  async getParams(): Promise<Param[]> {
    return [
      {
        name: 'hasActiveSubscription',
        label: 'Has active subscription',
        type: 'boolean',
      },
    ];
  }

  protected get query(): SelectQueryBuilder<Contact> {
    return createQueryBuilder(Contact, 'm').orderBy({
      firstname: 'ASC',
      lastname: 'ASC',
    });
  }

  protected getNewItemsQuery(): SelectQueryBuilder<Contact> {
    const query = super
      .getNewItemsQuery()
      .innerJoin('m.roles', 'mp')
      .andWhere("mp.type = 'member' AND mp.dateAdded <= :now")
      .andWhere(
        new Brackets((qb) => {
          qb.where('mp.dateExpires IS NULL').orWhere('mp.dateExpires > :now');
        })
      )
      .setParameters({ now: new Date() });

    if (this.ex!.params?.hasActiveSubscription) {
      query
        .innerJoin(ContactContribution, 'cc', 'cc.contactId = m.id')
        .andWhere('cc.subscriptionId IS NOT NULL');
    }

    return query;
  }

  async getExport(contacts: Contact[]): Promise<ExportResult> {
    return contacts.map((contact) => ({
      Id: contact.id,
      EmailAddress: contact.email,
      FirstName: contact.firstname,
      LastName: contact.lastname,
      ReferralCode: contact.referralCode,
      PollsCode: contact.pollsCode,
      ContributionType: contact.contributionType,
      ContributionMonthlyAmount: contact.contributionMonthlyAmount,
      ContributionPeriod: contact.contributionPeriod,
      ContributionDescription: contact.contributionDescription,
    }));
  }
}
