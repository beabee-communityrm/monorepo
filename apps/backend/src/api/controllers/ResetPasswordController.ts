import { RESET_SECURITY_FLOW_TYPE } from '@beabee/beabee-common';
import { NotFoundError } from '@beabee/core/errors';
import ContactsService from '@beabee/core/services/ContactsService';
import ResetSecurityFlowService from '@beabee/core/services/ResetSecurityFlowService';
import { AuthInfo } from '@beabee/core/type';
import { normalizeEmailAddress } from '@beabee/core/utils';

import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import {
  Body,
  JsonController,
  OnUndefined,
  Params,
  Post,
  Put,
  Req,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import {
  CreateResetPasswordDto,
  ResetPasswordLinkDto,
  UpdateResetPasswordDto,
} from '#api/dto/ResetPasswordDto';
import { UUIDParams } from '#api/params/UUIDParams';
import { login } from '#api/utils/auth';

@JsonController('/reset-password')
export class ResetPasswordController {
  /**
   * Starts a reset password flow. Members get the link by email; an operator
   * gets it in the response instead, so a fresh instance needs no mail setup.
   */
  @OnUndefined(204)
  @Post()
  async create(
    @CurrentAuth() auth: AuthInfo,
    @Body() data: CreateResetPasswordDto
  ): Promise<ResetPasswordLinkDto | undefined> {
    const email = normalizeEmailAddress(data.email);

    if (auth.method !== 'operator') {
      await ContactsService.resetPasswordBegin(email, data.resetUrl);
      return;
    }

    const contact = await ContactsService.findOneBy({ email });
    if (!contact) {
      throw new NotFoundError();
    }
    const rpFlow = await ResetSecurityFlowService.create(
      contact,
      RESET_SECURITY_FLOW_TYPE.PASSWORD
    );
    return plainToInstance(ResetPasswordLinkDto, {
      resetUrl: `${data.resetUrl}/${rpFlow.id}`,
    });
  }

  @OnUndefined(204)
  @Put('/:id')
  async complete(
    @Req() req: Request,
    @Params() { id }: UUIDParams,
    @Body() data: UpdateResetPasswordDto
  ): Promise<void> {
    const contact = await ContactsService.resetPasswordComplete(id, data);
    await login(req, contact);
  }
}
