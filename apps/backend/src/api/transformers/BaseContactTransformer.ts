import {
  ContactFilterName,
  Filters,
  PaginatedQuery,
  Rule,
  RuleGroup,
  calloutResponseFilters,
  contactCalloutFilters,
  contactFilters,
  getCalloutFilters,
  isRuleGroup
} from "@beabee/beabee-common";
import { isUUID } from "class-validator";

import { getRepository } from "@beabee/core/database";

import { BaseTransformer } from "@api/transformers/BaseTransformer";
import { prefixKeys } from "@api/utils";

import { Callout, Contact } from "@beabee/core/models";
import { contactFilterHandlers } from "@beabee/core/filter-handlers";

import { FilterHandlers } from "@beabee/core/type";

function flattenRules(rules: RuleGroup): Rule[] {
  return rules.rules.flatMap((rule) =>
    isRuleGroup(rule) ? flattenRules(rule) : rule
  );
}

export abstract class BaseContactTransformer<
  GetDto,
  GetOptsDto
> extends BaseTransformer<Contact, GetDto, ContactFilterName, GetOptsDto> {
  protected model = Contact;
  protected filters: Filters<ContactFilterName> = contactFilters;

  filterHandlers: FilterHandlers<string> = contactFilterHandlers;

  protected async transformFilters(
    query: GetOptsDto & PaginatedQuery
  ): Promise<[Partial<Filters<ContactFilterName>>, FilterHandlers<string>]> {
    const rules = query.rules ? flattenRules(query.rules) : [];

    // Load callouts referenced in a filter
    const calloutIds = rules
      .filter((r) => r.field.startsWith("callouts."))
      .map((r) => {
        const [_, calloutId] = r.field.split(".", 2);
        return calloutId;
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .filter((id) => isUUID(id));

    const filters: Partial<Filters> = {};
    for (const calloutId of calloutIds) {
      const callout = await getRepository(Callout).findOneBy({ id: calloutId });
      if (callout) {
        Object.assign(
          filters,
          prefixKeys(`callouts.${calloutId}.`, contactCalloutFilters),
          prefixKeys(`callouts.${calloutId}.responses.`, {
            ...calloutResponseFilters,
            ...getCalloutFilters(callout.formSchema)
          })
        );
      }
    }

    return [filters, {}];
  }
}
