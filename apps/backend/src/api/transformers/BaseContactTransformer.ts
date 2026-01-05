import {
  ContactFilterName,
  Filters,
  PaginatedQuery,
  calloutResponseFilters,
  contactCalloutFilters,
  contactFilters,
  flattenRules,
  getCalloutFilters,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { contactFilterHandlers } from '@beabee/core/filter-handlers';
import { Callout, Contact } from '@beabee/core/models';
import { FilterHandlers } from '@beabee/core/type';
import { prefixKeys } from '@beabee/core/utils/objects';

import { BaseTransformer } from '@api/transformers/BaseTransformer';
import { isUUID } from 'class-validator';

export abstract class BaseContactTransformer<
  GetDto,
  GetOptsDto,
> extends BaseTransformer<Contact, GetDto, ContactFilterName, GetOptsDto> {
  protected model = Contact;
  protected filters: Filters<ContactFilterName> = contactFilters;

  filterHandlers: FilterHandlers<string> = contactFilterHandlers;

  /**
   * Loads callouts referenced in a filter and adds their filters to the list.
   * Callout filters are prefixed with `callouts.<id>.`
   *
   * Callout response filters are also added under `callouts.<id>.responses.`,
   * they provide exactly the same filters as the callout responses endpoint.
   *
   * @param query
   * @returns
   */
  protected async transformFilters(
    query: GetOptsDto & PaginatedQuery
  ): Promise<[Partial<Filters<ContactFilterName>>, FilterHandlers<string>]> {
    const rules = query.rules ? flattenRules(query.rules) : [];

    // Get callout IDs referenced in the rules
    const calloutIds = rules
      .filter((r) => r.field.startsWith('callouts.'))
      .map((r) => {
        const [_, calloutId] = r.field.split('.', 2);
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
            ...getCalloutFilters(callout.formSchema),
          })
        );
      }
    }

    return [filters, {}];
  }
}
