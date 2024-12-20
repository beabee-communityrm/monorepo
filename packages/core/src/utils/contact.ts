import config from "#config/config";
import { Contact } from "#models/index";
import { ContributionPeriod, ContributionType } from "@beabee/beabee-common";
import { getActualAmount } from "./payment";

export function generateContactCode(contact: Partial<Contact>): string | null {
  if (contact.firstname && contact.lastname) {
    const no = ("000" + Math.floor(Math.random() * 1000)).slice(-3);
    return (contact.firstname[0] + contact.lastname[0] + no).toUpperCase();
  }
  return null;
}

export function getContributionDescription(
  type: ContributionType,
  monthlyAmount: number | null,
  period: ContributionPeriod | null
): string {
  if (type === "Gift") {
    return "Gift";
  } else if (type === "None" || !period || !monthlyAmount) {
    return "None";
  } else {
    return `${config.currencySymbol}${getActualAmount(monthlyAmount, period)}/${
      period === "monthly" ? "month" : "year"
    }`;
  }
}
