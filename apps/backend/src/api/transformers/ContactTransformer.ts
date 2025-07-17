import { GetContactWith, Rule, RuleGroup } from '@beabee/beabee-common';
import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { UnauthorizedError } from '@beabee/core/errors';
import { CalloutReviewer, Contact, ContactRole } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import PaymentService from '@beabee/core/services/PaymentService';
import { AuthInfo } from '@beabee/core/type';
import { generatePassword } from '@beabee/core/utils/auth';
import { batchSelect, batchUpdate } from '@beabee/core/utils/rules';

import {
  BatchUpdateContactDto,
  BatchUpdateContactUpdatesDto,
  GetContactDto,
  GetContactOptsDto,
  ListContactsDto,
  UpdateContactDto,
} from '@api/dto/ContactDto';
import { BaseContactTransformer } from '@api/transformers/BaseContactTransformer';
import ContactProfileTransformer from '@api/transformers/ContactProfileTransformer';
import ContactRoleTransformer from '@api/transformers/ContactRoleTransformer';
import { TransformPlainToInstance } from 'class-transformer';
import { In, SelectQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import contactTagTransformer from './ContactTagTransformer';

/**
 * Transformer for Contact entities.
 * Handles conversion, updates, and batch operations for contacts.
 *
 * @extends BaseContactTransformer<GetContactDto, GetContactOptsDto>
 */
class ContactTransformer extends BaseContactTransformer<
  GetContactDto,
  GetContactOptsDto
> {
  /**
   * Converts a Contact entity to its DTO representation.
   * Includes optional related data based on the provided options.
   *
   * @param contact - The contact entity to convert
   * @param auth - Auth info for permission checks
   * @param opts - Optional parameters to control included data
   * @returns The converted contact DTO
   */
  @TransformPlainToInstance(GetContactDto)
  convert(
    contact: Contact,
    auth: AuthInfo,
    opts?: GetContactOptsDto
  ): GetContactDto {
    return {
      id: contact.id,
      email: contact.email,
      firstname: contact.firstname,
      lastname: contact.lastname,
      joined: contact.joined,
      activeRoles: contact.activeRoles,
      ...(contact.lastSeen && {
        lastSeen: contact.lastSeen,
      }),
      ...(contact.contributionAmount && {
        contributionAmount: contact.contributionAmount,
      }),
      ...(contact.contributionPeriod && {
        contributionPeriod: contact.contributionPeriod,
      }),
      ...(opts?.with?.includes(GetContactWith.Profile) &&
        contact.profile && {
          profile: ContactProfileTransformer.convert(contact.profile, auth),
        }),
      ...(opts?.with?.includes(GetContactWith.Roles) && {
        roles: contact.roles.map(ContactRoleTransformer.convert),
      }),
      ...(opts?.with?.includes(GetContactWith.Contribution) && {
        contribution: contact.contributionInfo,
      }),
      ...(opts?.with?.includes(GetContactWith.IsReviewer) && {
        isReviewer: !!contact.isReviewer,
      }),
      ...(auth.roles.includes('admin') &&
        opts?.with?.includes(GetContactWith.Tags) && {
          tags: contact.tags.map((ct) => contactTagTransformer.convert(ct.tag)),
        }),
    };
  }

  protected async getNonAdminAuthRules(): Promise<Rule[]> {
    // Non-admins can only see themselves
    return [{ field: 'id', operator: 'equal', value: ['me'] }];
  }

  /**
   * Modifies the query builder to handle joins and sorting.
   * Supports profile joins and custom sorting for membership dates and names.
   *
   * @param qb - The query builder to modify
   * @param fieldPrefix - Prefix for field names in the query
   * @param query - The query containing sort and include options
   */
  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Contact>,
    fieldPrefix: string,
    query: ListContactsDto
  ): void {
    if (query.with?.includes(GetContactWith.Profile)) {
      qb.innerJoinAndSelect(`${fieldPrefix}profile`, 'profile');
    }

    switch (query.sort) {
      // Add member role to allow sorting by membershipStarts and membershipExpires
      case 'membershipStarts':
      case 'membershipExpires':
        qb.leftJoin(
          ContactRole,
          'cr',
          `cr.contactId = ${fieldPrefix}id AND cr.type = 'member'`
        )
          .addSelect('cr.dateAdded', 'membershipStarts')
          .addSelect(
            "COALESCE(cr.dateExpires, '-infinity'::timestamp)",
            'membershipExpires'
          )
          .orderBy(`"${query.sort}"`, query.order || 'ASC', 'NULLS LAST');
        break;

      // Always put empty first/last names at the bottom
      case 'firstname':
      case 'lastname':
        qb.orderBy(
          `NULLIF(${fieldPrefix}${query.sort}, '')`,
          query.order || 'ASC',
          'NULLS LAST'
        );
        break;
    }

    // Always sort by ID to ensure predictable offset and limit
    qb.addOrderBy(`${fieldPrefix}id`, 'ASC');
  }

  /**
   * Loads additional data for contacts after the main query.
   * Handles roles, contribution info, and tags.
   *
   * @param contacts - The contacts to modify
   * @param query - The query containing include options
   */
  protected async modifyItems(
    contacts: Contact[],
    query: ListContactsDto
  ): Promise<void> {
    await loadContactRoles(contacts);

    if (contacts.length > 0) {
      if (query.with?.includes(GetContactWith.Contribution)) {
        if (contacts.length > 1) {
          throw new Error('Cannot fetch contribution for multiple contacts');
        }

        contacts[0].contributionInfo = await PaymentService.getContributionInfo(
          contacts[0]
        );
      }

      if (query.with?.includes(GetContactWith.Tags)) {
        // Load tags after to ensure offset/limit work
        await contactTagTransformer.loadEntityTags(contacts);
      }

      // Check if the user is a reviewer
      // This is a bit hacky at the moment as it hard codes the logic of admins
      // always being reviewers, this should be revisted in the future
      if (query.with?.includes(GetContactWith.IsReviewer)) {
        // Optimise to not run the query for non-admins
        const nonAdmins = contacts.filter((c) => !c.hasRole('admin'));
        const reviewers =
          nonAdmins.length > 0
            ? await getRepository(CalloutReviewer).find({
                where: { contactId: In(nonAdmins.map((c) => c.id)) },
                select: { contactId: true },
              })
            : [];
        for (const contact of contacts) {
          contact.isReviewer =
            contact.hasRole('admin') ||
            reviewers.some((r) => r.contactId === contact.id);
        }
      }
    }
  }

  /**
   * Updates a single contact by its entity.
   * Handles contact details, profile updates, and permission checks.
   *
   * @param auth - Auth info for permission checks
   * @param target - The contact to update
   * @param data - The update data
   * @returns The updated contact DTO or undefined
   * @throws UnauthorizedError if user lacks permission for profile updates
   */
  async updateOneByContact(
    auth: AuthInfo,
    target: Contact,
    data: Partial<UpdateContactDto>
  ): Promise<GetContactDto | undefined> {
    if (data.email || data.firstname || data.lastname || data.password) {
      await ContactsService.updateContact(target, {
        ...(data.email && { email: data.email }),
        ...(data.firstname !== undefined && { firstname: data.firstname }),
        ...(data.lastname !== undefined && { lastname: data.lastname }),
        ...(data.password && {
          password: await generatePassword(data.password),
        }),
      });
    }

    if (data.profile) {
      if (
        !auth.roles.includes('admin') &&
        (data.profile.notes || data.profile.description)
      ) {
        throw new UnauthorizedError();
      }

      await ContactsService.updateContactProfile(target, data.profile);
    }

    return await this.fetchOneById(auth, target.id, {
      with: data.profile ? [GetContactWith.Profile] : [],
    });
  }

  /**
   * Performs batch updates on contacts.
   * Currently supports tag updates and basic contact field updates.
   *
   * @param auth - Auth info for permission checks
   * @param query_ - The batch update query containing rules and updates
   * @returns Number of affected contacts
   *
   * @example
   * await contactTransformer.update(auth, {
   *   rules: { condition: "OR", rules: [...] },
   *   updates: { tags: ["+tag1", "-tag2"] }
   * });
   */
  async updateWithTags(
    auth: AuthInfo,
    query_: BatchUpdateContactDto
  ): Promise<number> {
    const { query, filters, filterHandlers } = await this.prepareQuery(
      query_,
      auth,
      'update'
    );

    const { tagUpdates, contactUpdates } = this.getUpdateData(query.updates);
    const hasContactUpdates = Object.keys(contactUpdates).length > 0;

    // Choose the appropriate batch operation:
    // - batchUpdate: When contact properties need to be modified
    // - batchSelect: When only related data (tags) needs to be updated
    // This separation prevents empty update errors from TypeORM
    const result = hasContactUpdates
      ? await batchUpdate(
          this.model,
          filters,
          query.rules,
          contactUpdates,
          auth.contact,
          filterHandlers,
          (qb) => qb.returning(['id'])
        )
      : await batchSelect(
          this.model,
          filters,
          query.rules,
          auth.contact,
          filterHandlers
        );

    const contacts: { id: string }[] = result.raw;

    if (tagUpdates && contacts.length > 0) {
      await contactTagTransformer.updateEntityTags(
        contacts.map((c) => c.id),
        tagUpdates
      );
    }

    return result.affected || -1;
  }

  /**
   * Extracts update data from the batch update DTO.
   * Separates tag updates from contact field updates.
   *
   * @param data - The update data from the request
   * @returns Object containing tag updates and contact updates
   */
  protected getUpdateData(data: Partial<BatchUpdateContactUpdatesDto>): {
    tagUpdates: string[] | undefined;
    contactUpdates: QueryDeepPartialEntity<Contact>;
  } {
    const { tags: tagUpdates, ...contactUpdates } = data;

    return {
      tagUpdates,
      contactUpdates: contactUpdates || {},
    };
  }
}

/**
 * Loads roles for an array of contacts.
 * Used to populate the roles relationship after the main query.
 *
 * @param contacts - Array of contacts to load roles for
 */
export async function loadContactRoles(contacts: Contact[]): Promise<void> {
  if (contacts.length > 0) {
    // Load roles after to ensure offset/limit work
    const roles = await createQueryBuilder(ContactRole, 'cr')
      .where('cr.contactId IN (:...ids)', {
        ids: contacts.map((t) => t.id),
      })
      .getMany();
    for (const contact of contacts) {
      contact.roles = roles.filter((p) => p.contactId === contact.id);
    }
  }
}

export default new ContactTransformer();
