import { ContributionPeriod, ContributionType } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { createQueryBuilder } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact, ContactContribution, Payment } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { getActualAmount } from '@beabee/core/utils/payment';

import { Brackets } from 'typeorm';

const log = mainLogger.child({ app: 'test-users' });

interface TestUserFilters {
  isActive: Brackets;
  isInactive: Brackets;
  isSuperAdmin: Brackets;
  isGift: Brackets;
  hasSubscription: Brackets;
  hasCancelled: Brackets;
  isPayingFee: Brackets;
  noScheduledPayments: Brackets;
  hasScheduledPayments: Brackets;
  noFailedPayments: Brackets;
  hasFailedPayments: Brackets;
}

/**
 * Lists test users with various contribution scenarios
 * @param dryRun If true, only logs what would be done
 */
export const listTestUsers = async (dryRun = false): Promise<void> => {
  await runApp(async () => {
    const filters = await getFilters();

    // Active users
    await logContactVaryContributions('Active, no scheduled payments', [
      filters.isActive,
      filters.noScheduledPayments,
    ]);

    await logContactVaryContributions('Active, has scheduled payments', [
      filters.isActive,
      filters.hasScheduledPayments,
    ]);

    // Inactive users
    await logContactVaryContributions('Inactive due to failed payment', [
      filters.hasSubscription,
      filters.isInactive,
      filters.hasFailedPayments,
    ]);

    await logContactVaryContributions(
      'Inactive due to failed payment, has scheduled payments',
      [
        filters.hasSubscription,
        filters.isInactive,
        filters.hasFailedPayments,
        filters.hasScheduledPayments,
      ]
    );

    // Cancelled memberships
    await logContactVaryContributions('Cancelled active member', [
      filters.isActive,
      filters.hasCancelled,
    ]);

    await logContactVaryContributions('Cancelled inactive member', [
      filters.isInactive,
      filters.hasCancelled,
    ]);

    // Gift memberships
    await logContact('Active, gift membership', [
      filters.isActive,
      filters.isGift,
    ]);

    await logContact('Inactive, gift membership', [
      filters.isInactive,
      filters.isGift,
    ]);

    // Special cases
    await logContact('Active, paying fee', [
      filters.isActive,
      filters.isPayingFee,
    ]);

    await logContact('Super admin account', [filters.isSuperAdmin]);

    log.info('Test users listing completed');
  });
};

/**
 * Logs contact details for a specific test scenario
 */
async function logContact(type: string, conditions: Brackets[]) {
  const qb = createQueryBuilder(Contact, 'm')
    .innerJoinAndSelect('m.roles', 'mp')
    .where('TRUE');

  for (const condition of conditions) {
    qb.andWhere(condition);
  }

  const contact = await qb.getOne();
  log.info(`# ${type}`);
  if (contact) {
    log.info(`${contact.fullname}, ${contact.email}`);
    log.info(`${config.audience}/login/as/${contact.id}`);
  } else {
    log.info('No contact found');
  }
}

/**
 * Logs contacts for different contribution amounts and periods
 */
async function logContactVaryContributions(
  type: string,
  conditions: Brackets[]
) {
  const amounts = [1, 3, 5];
  for (const amount of amounts) {
    for (const period of [
      ContributionPeriod.Monthly,
      ContributionPeriod.Annually,
    ]) {
      await logContact(
        `${type}, £${getActualAmount(amount, period)}/${period}`,
        [
          ...conditions,
          new Brackets((qb) =>
            qb.where(
              'm.contributionMonthlyAmount = :amount AND m.contributionPeriod = :period',
              { amount, period }
            )
          ),
        ]
      );
    }
  }
}

/**
 * Generates filter conditions for different user scenarios
 */
async function getFilters(): Promise<TestUserFilters> {
  const now = new Date();

  const hasScheduledPayments = createQueryBuilder()
    .subQuery()
    .select('p.contactId')
    .from(Payment, 'p')
    .where("p.status = 'pending'");

  const hasFailedPayments = createQueryBuilder()
    .subQuery()
    .select('p.contactId')
    .from(Payment, 'p')
    .where("p.status = 'failed'");

  const hasSubscription = createQueryBuilder()
    .subQuery()
    .select('cc.contactId')
    .from(ContactContribution, 'cc')
    .where('cc.subscriptionId IS NOT NULL');

  const hasCancelled = createQueryBuilder()
    .subQuery()
    .select('cc.contactId')
    .from(ContactContribution, 'cc')
    .where('cc.cancelledAt IS NOT NULL');

  const isPayingFee = createQueryBuilder()
    .subQuery()
    .select('cc.contactId')
    .from(ContactContribution, 'cc')
    .where('cc.payFee = TRUE');

  return {
    isActive: new Brackets((qb) =>
      qb.where("mp.type = 'member' AND mp.dateExpires > :now", { now })
    ),
    isInactive: new Brackets((qb) =>
      qb.where("mp.type = 'member' AND mp.dateExpires < :now", { now })
    ),
    isSuperAdmin: new Brackets((qb) => qb.where("mp.type = 'superadmin'")),
    isGift: new Brackets((qb) =>
      qb.where('m.contributionType = :gift', {
        gift: ContributionType.Gift,
      })
    ),
    hasSubscription: new Brackets((qb) =>
      qb.where('m.id IN ' + hasSubscription.getQuery())
    ),
    hasCancelled: new Brackets((qb) =>
      qb.where('m.id IN ' + hasCancelled.getQuery())
    ),
    isPayingFee: new Brackets((qb) =>
      qb.where('m.id IN ' + isPayingFee.getQuery())
    ),
    noScheduledPayments: new Brackets((qb) =>
      qb.where('m.id NOT IN ' + hasScheduledPayments.getQuery())
    ),
    hasScheduledPayments: new Brackets((qb) =>
      qb.where('m.id IN ' + hasScheduledPayments.getQuery())
    ),
    noFailedPayments: new Brackets((qb) =>
      qb.where('m.id NOT IN ' + hasFailedPayments.getQuery())
    ),
    hasFailedPayments: new Brackets((qb) =>
      qb.where('m.id IN ' + hasFailedPayments.getQuery())
    ),
  };
}
