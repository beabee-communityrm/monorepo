import { Rule } from "@beabee/beabee-common";
import { getRepository } from "@beabee/core/database";
import { Contact, CalloutReviewer } from "@beabee/core/models";

export async function getReviewerRules(
  contact: Contact,
  field: "id" | "calloutId"
): Promise<Rule[]> {
  const reviewer = await getRepository(CalloutReviewer).findBy({
    contactId: contact.id
  });

  return reviewer.map((r) => ({
    field,
    operator: "equal",
    value: [r.calloutId]
  }));
}
