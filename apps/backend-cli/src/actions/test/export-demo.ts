import { createQueryBuilder } from '@beabee/core/database';
import { Callout, CalloutResponse, Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
  initializeJsonDump,
  saveJsonDump,
} from '@beabee/core/tools/database/anonymisers/index';
import {
  ModelAnonymiser,
  calloutResponseCommentsAnonymiser,
  calloutResponseTagsAnonymiser,
  calloutResponsesAnonymiser,
  calloutTagsAnonymiser,
  calloutVariantAnonymiser,
  calloutsAnonymiser,
  contactAnonymiser,
  contactContributionAnonymiser,
  contactProfileAnonymiser,
  contactRoleAnonymiser,
  paymentsAnonymiser,
  projectContactsAnonymiser,
  projectEngagmentsAnonymiser,
  referralsAnonymiser,
  resetSecurityFlowAnonymiser,
  segmentContactsAnonymiser,
} from '@beabee/core/tools/database/anonymisers/models';

import { Brackets } from 'typeorm';

const contactAnonymisers = [
  contactAnonymiser,
  contactRoleAnonymiser,
  contactProfileAnonymiser,
  paymentsAnonymiser,
  contactContributionAnonymiser,
] as ModelAnonymiser[];

const calloutsAnonymisers = [
  calloutsAnonymiser,
  calloutTagsAnonymiser,
  calloutVariantAnonymiser,
] as ModelAnonymiser[];

const calloutResponseAnonymisers = [
  calloutResponsesAnonymiser,
  // calloutResponseCommentsAnonymiser, TODO: make sure contact exists in export
  calloutResponseTagsAnonymiser,
] as ModelAnonymiser[];

/**
 * Export a demo database with a subset of data
 *
 * @param dryRun If true, only logs what would be done
 * @param type Export type: json or sql
 */
export const exportDemo = async (
  dryRun = false,
  type: 'json' | 'sql' = 'json'
): Promise<void> => {
  await runApp(async () => {
    const valueMap = new Map<string, unknown>();

    const allAnonymisers = [
      ...contactAnonymisers,
      ...calloutsAnonymisers,
      ...calloutResponseAnonymisers,
      // Clear comments until above is fixed
      calloutResponseCommentsAnonymiser,
      // Clear models that link to contacts
      projectContactsAnonymiser,
      projectEngagmentsAnonymiser,
      segmentContactsAnonymiser,
      referralsAnonymiser,
      resetSecurityFlowAnonymiser,
    ] as ModelAnonymiser[];

    if (type === 'json') {
      initializeJsonDump(allAnonymisers);
    } else {
      clearModels(allAnonymisers);
    }

    // Get 400 random contacts
    const contacts = await createQueryBuilder(Contact, 'item')
      .select('item.id')
      .orderBy('random()')
      .limit(400)
      .getMany();
    const contactIds = contacts.map((m) => m.id);

    for (const anonymiser of contactAnonymisers) {
      const pk = anonymiser === contactAnonymiser ? 'id' : 'contactId';
      await anonymiseModel(
        anonymiser,
        (qb) =>
          qb.where(`item.${pk} IN (:...contacts)`, { contacts: contactIds }),
        valueMap,
        type
      );
    }

    // Get the 20 latest callouts
    const callouts = await createQueryBuilder(Callout, 'item')
      .select('item.id')
      .orderBy('item.date', 'DESC')
      .limit(20)
      .getMany();
    const calloutIds = callouts.map((c) => c.id);

    for (const anonymiser of calloutsAnonymisers) {
      const pk = anonymiser === calloutsAnonymiser ? 'id' : 'calloutId';
      await anonymiseModel(
        anonymiser,
        (qb) => qb.where(`item.${pk} IN (:...ids)`, { ids: calloutIds }),
        valueMap,
        type
      );
    }

    const responses = await createQueryBuilder(CalloutResponse, 'item')
      .select('item.id')
      .where('item.calloutId IN (:...ids)', { ids: calloutIds })
      .andWhere(
        new Brackets((qb) =>
          qb
            .where('item.contact IS NULL')
            .orWhere('item.contact IN (:...contacts)')
        ),
        { contacts: contactIds }
      )
      .andWhere(
        new Brackets((qb) =>
          qb
            .where('item.assignee IS NULL')
            .orWhere('item.assignee IN (:...contacts)')
        )
      )
      .getMany();
    const responseIds = responses.map((r) => r.id);

    for (const anonymiser of calloutResponseAnonymisers) {
      const pk =
        anonymiser === calloutResponsesAnonymiser ? 'id' : 'responseId';
      await anonymiseModel(
        anonymiser,
        (qb) =>
          qb.where(`item.${pk} IN (:...responses)`, { responses: responseIds }),
        valueMap,
        type
      );
    }

    if (type === 'json') {
      saveJsonDump(dryRun);
    }
  });
};
