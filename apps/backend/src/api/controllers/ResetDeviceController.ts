import ContactsService from '@beabee/core/services/ContactsService';

import type { Request } from 'express';
import {
  Body,
  JsonController,
  OnUndefined,
  Params,
  Post,
  Put,
  Req,
} from 'routing-controllers';

import type {
  CreateResetDeviceDto,
  UpdateResetDeviceDto,
} from '#api/dto/ResetDeviceDto';
import type { UUIDParams } from '#api/params/UUIDParams';
import { login } from '#api/utils/auth';

@JsonController('/reset-device')
export class ResetDeviceController {
  @OnUndefined(204)
  @Post()
  async create(@Body() data: CreateResetDeviceDto): Promise<void> {
    await ContactsService.resetDeviceBegin(
      data.email,
      data.type,
      data.resetUrl
    );
  }

  @OnUndefined(204)
  @Put('/:id')
  async complete(
    @Req() req: Request,
    @Params() { id }: UUIDParams,
    @Body() data: UpdateResetDeviceDto
  ): Promise<void> {
    const contact = await ContactsService.resetDeviceComplete(
      id,
      data.password
    );
    await login(req, contact);
  }
}
