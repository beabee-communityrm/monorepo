import { GetContactWith, PaymentForm } from '@beabee/beabee-common';
import {
  CantUpdateContribution,
  NoPaymentMethod,
  UnauthorizedError,
} from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import ContactMfaService from '@beabee/core/services/ContactMfaService';
import ContactsService from '@beabee/core/services/ContactsService';
import DispatchService from '@beabee/core/services/DispatchService';
import PaymentFlowService from '@beabee/core/services/PaymentFlowService';
import PaymentService from '@beabee/core/services/PaymentService';
import { AuthInfo } from '@beabee/core/type';
import { generatePassword } from '@beabee/core/utils/auth';
import { getMonthlyAmount } from '@beabee/core/utils/payment';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import PartialBody from '@api/decorators/PartialBody';
import { TargetUser } from '@api/decorators/TargetUser';
import { GetExportQuery } from '@api/dto/BaseDto';
import {
  BatchUpdateContactDto,
  BatchUpdateContactResultDto,
  CreateContactDto,
  GetContactDto,
  GetContactOptsDto,
  GetContributionInfoDto,
  ListContactsDto,
  UpdateContactDto,
} from '@api/dto/ContactDto';
import {
  CreateContactMfaDto,
  DeleteContactMfaDto,
  GetContactMfaDto,
} from '@api/dto/ContactMfaDto';
import {
  GetContactRoleDto,
  UpdateContactRoleDto,
} from '@api/dto/ContactRoleDto';
import {
  ForceUpdateContributionDto,
  StartContributionDto,
  UpdateContributionDto,
} from '@api/dto/ContributionDto';
import { CompleteJoinFlowDto, StartJoinFlowDto } from '@api/dto/JoinFlowDto';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import {
  CreatePaymentDto,
  GetPaymentDto,
  ListPaymentsDto,
} from '@api/dto/PaymentDto';
import { GetPaymentFlowDto } from '@api/dto/PaymentFlowDto';
import { ContactRoleParams } from '@api/params/ContactRoleParams';
import ContactExporter from '@api/transformers/ContactExporter';
import ContactRoleTransformer from '@api/transformers/ContactRoleTransformer';
import ContactTransformer from '@api/transformers/ContactTransformer';
import PaymentTransformer from '@api/transformers/PaymentTransformer';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import {
  Authorized,
  BadRequestError,
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Params,
  Patch,
  Post,
  Put,
  QueryParams,
  Res,
} from 'routing-controllers';

@JsonController('/contact')
@Authorized()
export class ContactController {
  @Authorized('admin')
  @Post('/')
  async createContact(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Body() data: CreateContactDto
  ): Promise<GetContactDto> {
    const contact = await ContactsService.createContact(
      {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        ...(data.password && {
          password: await generatePassword(data.password),
        }),
      },
      data.profile
    );

    if (data.roles) {
      for (const role of data.roles) {
        await ContactsService.updateContactRole(contact, role.role, role);
      }
    }

    if (data.contribution) {
      await ContactsService.forceUpdateContactContribution(
        contact,
        data.contribution
      );
    }

    return ContactTransformer.convert(contact, auth, {
      with: [
        ...(data.profile ? [GetContactWith.Profile] : []),
        ...(data.roles ? [GetContactWith.Roles] : []),
      ],
    });
  }

  @Get('/')
  async getContacts(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListContactsDto
  ): Promise<PaginatedDto<GetContactDto>> {
    return await ContactTransformer.fetch(auth, query);
  }

  /**
   * Batch update multiple contacts at once based on filter rules
   *
   * This endpoint allows administrators to update multiple contacts simultaneously
   * using a set of filter rules to determine which contacts to update.
   *
   * @param auth The authenticated user's information (must be admin)
   * @param data Contains both the filter rules and the updates to apply
   * @returns The number of contacts that were affected by the update
   *
   * @example
   * // Update all contacts with a specific email domain
   * {
   *   "rules": {
   *     "condition": "AND",
   *     "rules": [{ "field": "email", "operator": "contains", "value": ["@example.com"] }]
   *   },
   *   "updates": {
   *     "profile": { "notes": "Domain migration pending" }
   *   }
   * }
   */
  @Authorized('admin')
  @Patch('/')
  async updateContacts(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @PartialBody() data: BatchUpdateContactDto
  ): Promise<BatchUpdateContactResultDto> {
    const affected = await ContactTransformer.updateWithTags(auth, data);
    return plainToInstance(BatchUpdateContactResultDto, { affected });
  }

  @Get('.csv')
  async exportContacts(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: GetExportQuery,
    @Res() res: Response
  ): Promise<Response> {
    const [exportName, exportData] = await ContactExporter.export(auth, query);
    res.attachment(exportName).send(exportData);
    return res;
  }

  @Get('/:id')
  async getContact(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @TargetUser() target: Contact,
    @QueryParams() query: GetContactOptsDto
  ): Promise<GetContactDto | undefined> {
    return await ContactTransformer.fetchOneById(auth, target.id, query);
  }

  /**
   * Update a single contact by their ID
   *
   * This endpoint allows updating a specific contact's information. Unlike the batch update,
   * this endpoint:
   * - Can be used by non-admins to update their own contact information
   * - Returns the updated contact data
   * - Requires the contact ID in the URL
   * - Validates access rights through @TargetUser decorator
   *
   * @param auth The authenticated user's information
   * @param target The contact to update (validated through @TargetUser)
   * @param data The updates to apply to the contact
   * @returns The updated contact information
   *
   * @example
   * // Update a contact's name
   * {
   *   "firstname": "John",
   *   "lastname": "Doe"
   * }
   */
  @Patch('/:id')
  async updateContact(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @TargetUser() target: Contact,
    @PartialBody() data: UpdateContactDto // Should be Partial<UpdateContactDto>
  ): Promise<GetContactDto | undefined> {
    return await ContactTransformer.updateOneByContact(auth, target, data);
  }

  @Delete('/:id')
  @OnUndefined(204)
  async deleteContact(@TargetUser() target: Contact): Promise<void> {
    await DispatchService.permanentlyDeleteContact(target);
  }

  @Get('/:id/contribution')
  async getContribution(
    @TargetUser() target: Contact
  ): Promise<GetContributionInfoDto> {
    const ret = await PaymentService.getContributionInfo(target);
    return plainToInstance(GetContributionInfoDto, ret);
  }

  @Patch('/:id/contribution')
  async updateContribution(
    @TargetUser() target: Contact,
    @Body() data: UpdateContributionDto
  ): Promise<GetContributionInfoDto> {
    const form = {
      ...data,
      monthlyAmount: getMonthlyAmount(data.amount, data.period),
    };

    if (!(await PaymentService.canChangeContribution(target, true, form))) {
      throw new CantUpdateContribution();
    }

    await ContactsService.updateContactContribution(target, form);
    return await this.getContribution(target);
  }

  @Post('/:id/contribution')
  async startContribution(
    @TargetUser() target: Contact,
    @Body() data: StartContributionDto
  ): Promise<GetPaymentFlowDto> {
    const form = {
      ...data,
      monthlyAmount: getMonthlyAmount(data.amount, data.period),
    };
    const flow = await PaymentFlowService.startContributionUpdate(
      target,
      data.paymentMethod,
      data.completeUrl,
      form
    );
    return plainToInstance(GetPaymentFlowDto, flow);
  }

  /**
   * Get contact multi factor authentication if exists
   * @param target The target contact
   */
  @Get('/:id/mfa')
  async getContactMfa(
    @TargetUser() target: Contact
  ): Promise<GetContactMfaDto | null> {
    const mfa = await ContactMfaService.get(target);
    return mfa ? plainToInstance(GetContactMfaDto, mfa) : null;
  }

  /**
   * Create contact multi factor authentication
   * @param target The target contact
   * @param data The data to create the contact multi factor authentication
   */
  @OnUndefined(201)
  @Post('/:id/mfa')
  async createContactMfa(
    @Body() data: CreateContactMfaDto,
    @TargetUser() target: Contact
  ): Promise<void> {
    await ContactMfaService.create(target, data);
  }

  /**
   * Delete contact multi factor authentication
   * @param target The target contact
   * @param data The data to delete the contact multi factor authentication
   * @param id The contact id
   */
  @OnUndefined(201)
  @Delete('/:id/mfa')
  async deleteContactMfa(
    @TargetUser() target: Contact,
    @Body() data: DeleteContactMfaDto,
    @Params() { id }: { id: string }
  ): Promise<void> {
    if (id === 'me') {
      await ContactMfaService.deleteSecure(target, data);
    } else {
      // It's secure to call this unsecure method here because the user is an admin,
      // this is checked in the `@TargetUser()` decorator
      await ContactMfaService.deleteUnsecure(target);
    }
  }

  @OnUndefined(204)
  @Post('/:id/contribution/cancel')
  async cancelContribution(@TargetUser() target: Contact): Promise<void> {
    await ContactsService.cancelContactContribution(
      target,
      'cancelled-contribution-no-survey'
    );
  }

  @Post('/:id/contribution/complete')
  async completeStartContribution(
    @TargetUser() target: Contact,
    @Body() data: CompleteJoinFlowDto
  ): Promise<GetContributionInfoDto> {
    const updated = await PaymentFlowService.finalizeContributionUpdate(
      target,
      data.paymentFlowId
    );
    if (!updated) {
      throw new NotFoundError();
    }
    return await this.getContribution(target);
  }

  /**
   * TODO: Remove this!
   * @deprecated This is a temporary API endpoint until we rework the contribution/payment tables
   * @param target
   * @param data
   * @returns
   */
  @Authorized('admin')
  @Patch('/:id/contribution/force')
  async forceUpdateContribution(
    @TargetUser() target: Contact,
    @Body() data: ForceUpdateContributionDto
  ): Promise<GetContributionInfoDto> {
    await ContactsService.forceUpdateContactContribution(target, data);
    return await this.getContribution(target);
  }

  @Post('/:id/payment')
  async createOneTimePayment(
    @TargetUser() target: Contact,
    @Body() data: CreatePaymentDto
  ): Promise<GetPaymentFlowDto> {
    const form: PaymentForm = {
      monthlyAmount: data.amount,
      payFee: data.payFee,
      prorate: false,
      period: 'one-time',
    };
    const params = await PaymentFlowService.startContributionUpdate(
      target,
      data.paymentMethod,
      data.completeUrl,
      form
    );
    return plainToInstance(GetPaymentFlowDto, params);
  }

  @OnUndefined(204)
  @Post('/:id/payment/complete')
  async completeOneTimePayment(
    @TargetUser() target: Contact,
    @Body() data: CompleteJoinFlowDto
  ): Promise<void> {
    const updated = await PaymentFlowService.finalizeContributionUpdate(
      target,
      data.paymentFlowId
    );
    if (!updated) {
      throw new NotFoundError();
    }
  }

  @Get('/:id/payment')
  async getPayments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @TargetUser() target: Contact,
    @QueryParams() query: ListPaymentsDto
  ): Promise<PaginatedDto<GetPaymentDto>> {
    return PaymentTransformer.fetch(auth, {
      ...query,
      rules: {
        condition: 'AND',
        rules: [
          ...(query.rules ? [query.rules] : []),
          { field: 'contact', operator: 'equal', value: [target.id] },
        ],
      },
    });
  }

  @Put('/:id/payment-method')
  async updatePaymentMethod(
    @TargetUser() target: Contact,
    @Body() data: StartJoinFlowDto
  ): Promise<GetPaymentFlowDto> {
    // Use existing payment method if one is not provided.
    // This means the user is changing to the same payment method but with new
    // payment details (e.g. new card)
    const paymentMethod =
      data.paymentMethod ||
      (await PaymentService.getContribution(target)).method;
    if (!paymentMethod) {
      throw new NoPaymentMethod();
    }

    const paymentFlow = await PaymentFlowService.startContributionUpdate(
      target,
      paymentMethod,
      data.completeUrl
    );
    return plainToInstance(GetPaymentFlowDto, paymentFlow);
  }

  @Post('/:id/payment-method/complete')
  async completeUpdatePaymentMethod(
    @TargetUser() target: Contact,
    @Body() data: CompleteJoinFlowDto
  ): Promise<GetContributionInfoDto> {
    const updated = await PaymentFlowService.finalizeContributionUpdate(
      target,
      data.paymentFlowId
    );
    if (!updated) {
      throw new NotFoundError();
    }

    return await this.getContribution(target);
  }

  @Authorized('admin')
  @Put('/:id/role/:roleType')
  async updateRole(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @TargetUser() target: Contact,
    @Params() { roleType }: ContactRoleParams,
    @Body() data: UpdateContactRoleDto
  ): Promise<GetContactRoleDto> {
    // Validate dates if both are provided
    if (
      data.dateExpires !== undefined &&
      data.dateExpires !== null &&
      data.dateAdded &&
      data.dateAdded >= data.dateExpires
    ) {
      throw new BadRequestError();
    }

    if (roleType === 'superadmin' && !auth.roles.includes('superadmin')) {
      throw new UnauthorizedError();
    }

    const role = await ContactsService.updateContactRole(
      target,
      roleType,
      data
    );
    return ContactRoleTransformer.convert(role);
  }

  @Authorized('admin')
  @Delete('/:id/role/:roleType')
  @OnUndefined(201)
  async deleteRole(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @TargetUser() target: Contact,
    @Params() { roleType }: ContactRoleParams
  ): Promise<void> {
    if (roleType === 'superadmin' && !auth.roles.includes('superadmin')) {
      throw new UnauthorizedError();
    }

    const revoked = await ContactsService.revokeContactRole(target, roleType);
    if (!revoked) {
      throw new NotFoundError();
    }
  }
}
