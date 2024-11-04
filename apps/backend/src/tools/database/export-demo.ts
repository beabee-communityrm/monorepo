import "module-alias/register";

import { Brackets } from "typeorm";

import { createQueryBuilder } from "@beabee/core/database";
import { runApp } from "@core/server";

import { Contact, Callout, CalloutResponse } from "@beabee/core/models";

import {
  ModelAnonymiser,
  contactContributionAnonymiser,
  paymentsAnonymiser,
  contactAnonymiser,
  contactRoleAnonymiser,
  contactProfileAnonymiser,
  calloutResponsesAnonymiser,
  calloutsAnonymiser,
  calloutTagsAnonymiser,
  calloutResponseCommentsAnonymiser,
  calloutResponseTagsAnonymiser,
  segmentContactsAnonymiser,
  projectContactsAnonymiser,
  projectEngagmentsAnonymiser,
  referralsAnonymiser,
  resetSecurityFlowAnonymiser,
  calloutVariantAnonymiser
} from "./anonymisers/models";
import { anonymiseModel, clearModels } from "./anonymisers";

const contactAnonymisers = [
  contactAnonymiser,
  contactRoleAnonymiser,
  contactProfileAnonymiser,
  paymentsAnonymiser,
  contactContributionAnonymiser
] as ModelAnonymiser[];

const calloutsAnonymisers = [
  calloutsAnonymiser,
  calloutTagsAnonymiser,
  calloutVariantAnonymiser
] as ModelAnonymiser[];

const calloutResponseAnonymisers = [
  calloutResponsesAnonymiser,
  // calloutResponseCommentsAnonymiser, TODO: make sure contact exists in export
  calloutResponseTagsAnonymiser
] as ModelAnonymiser[];

async function main() {
  const valueMap = new Map<string, unknown>();

  clearModels([
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
    resetSecurityFlowAnonymiser
  ] as ModelAnonymiser[]);

  // Get 400 random contacts
  const contacts = await createQueryBuilder(Contact, "item")
    .select("item.id")
    .orderBy("random()")
    .limit(400)
    .getMany();
  const contactIds = contacts.map((m) => m.id);

  for (const anonymiser of contactAnonymisers) {
    const pk = anonymiser === contactAnonymiser ? "id" : "contactId";
    await anonymiseModel(
      anonymiser,
      (qb) =>
        qb.where(`item.${pk} IN (:...contacts)`, { contacts: contactIds }),
      valueMap
    );
  }

  // Get the 20 latest callouts
  const callouts = await createQueryBuilder(Callout, "item")
    .select("item.id")
    .orderBy("item.date", "DESC")
    .limit(20)
    .getMany();
  const calloutIds = callouts.map((c) => c.id);

  for (const anonymiser of calloutsAnonymisers) {
    const pk = anonymiser === calloutsAnonymiser ? "id" : "calloutId";
    await anonymiseModel(
      anonymiser,
      (qb) => qb.where(`item.${pk} IN (:...ids)`, { ids: calloutIds }),
      valueMap
    );
  }

  const responses = await createQueryBuilder(CalloutResponse, "item")
    .select("item.id")
    .where("item.calloutId IN (:...ids)", { ids: calloutIds })
    .andWhere(
      new Brackets((qb) =>
        qb
          .where("item.contact IS NULL")
          .orWhere("item.contact IN (:...contacts)")
      ),
      { contacts: contactIds }
    )
    .andWhere(
      new Brackets((qb) =>
        qb
          .where("item.assignee IS NULL")
          .orWhere("item.assignee IN (:...contacts)")
      )
    )
    .getMany();
  const responseIds = responses.map((r) => r.id);

  for (const anonymiser of calloutResponseAnonymisers) {
    const pk = anonymiser === calloutResponsesAnonymiser ? "id" : "responseId";
    await anonymiseModel(
      anonymiser,
      (qb) =>
        qb.where(`item.${pk} IN (:...responses)`, { responses: responseIds }),
      valueMap
    );
  }
}

runApp(main);
