import ContactsService from '@beabee/core/services/ContactsService';

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

import {
  CreateResetPasswordDto,
  UpdateResetPasswordDto,
} from '#api/dto/ResetPasswordDto';
import { UUIDParams } from '#api/params/UUIDParams';
import { login } from '#api/utils/auth';

@JsonController('/reset-password')
export class ResetPasswordController {
  @OnUndefined(204)
  @Post()
  async create(@Body() data: CreateResetPasswordDto): Promise<void> {
    await ContactsService.resetPasswordBegin(data.email, data.resetUrl);
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
