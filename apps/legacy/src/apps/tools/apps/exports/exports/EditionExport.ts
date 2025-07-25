import { ContributionType } from '@beabee/beabee-common';
import { createQueryBuilder } from '@beabee/core/database';
import { Contact } from '@beabee/core/models';

import _ from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { Param } from '#core/utils/params';

import ActiveMembersExport from './ActiveMembersExport';
import { ExportResult } from './BaseExport';

export default class EditionExport extends ActiveMembersExport {
  exportName = 'Edition export';
  itemStatuses = ['added', 'sent'];
  itemName = 'members';
  idColumn = 'm.id';

  async getParams(): Promise<Param[]> {
    return [
      {
        name: 'monthlyAmountThreshold',
        label: 'Monthly contribution amount threshold',
        type: 'number',
      },
      {
        name: 'includeNonOptIn',
        label: 'Include those without delivery opt in',
        type: 'boolean',
      },
    ];
  }

  protected get query(): SelectQueryBuilder<Contact> {
    return createQueryBuilder(Contact, 'm')
      .innerJoinAndSelect('m.profile', 'profile')
      .orderBy({
        firstname: 'ASC',
        lastname: 'ASC',
      });
  }

  protected getNewItemsQuery(): SelectQueryBuilder<Contact> {
    const query = super
      .getNewItemsQuery()
      .andWhere('m.contributionMonthlyAmount >= :amount')
      .setParameters({
        now: new Date(),
        amount: this.ex!.params?.monthlyAmountThreshold || 3,
      });

    if (!this.ex!.params?.includeNonOptIn) {
      query.andWhere('profile.deliveryOptIn = TRUE');
    }

    return query;
  }

  async getExport(contacts: Contact[]): Promise<ExportResult> {
    return contacts.map((contact) => {
      const deliveryAddress = contact.profile.deliveryAddress || {
        line1: '',
        line2: '',
        city: '',
        postcode: '',
      };

      return {
        EmailAddress: contact.email,
        FirstName: contact.firstname,
        LastName: contact.lastname,
        Address1: deliveryAddress.line1,
        Address2: deliveryAddress.line2,
        City: deliveryAddress.city,
        Postcode: deliveryAddress.postcode.trim().toUpperCase(),
        ReferralCode: contact.referralCode,
        IsGift: contact.contributionType === ContributionType.Gift,
        ContributionMonthlyAmount: contact.contributionMonthlyAmount,
      };
    });
  }
}
