import { Contact } from "@beabee/core/models";
import { calcRenewalDate } from "@beabee/core/utils/payment";
import { differenceInMonths } from "date-fns";

/**
 * Calculate the number of months left until the next renewal date
 * TODO: Remove when legacy member app is removed
 *
 * @deprecated
 * @param contact The contact to calculate for
 * @returns The number of months left
 */
export function calcMonthsLeft(contact: Contact): number {
  const renewalDate = calcRenewalDate(contact);
  return renewalDate
    ? Math.max(0, differenceInMonths(renewalDate, new Date()))
    : 0;
}
