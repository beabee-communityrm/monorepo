import { Request } from "express";
import {
  Body,
  JsonController,
  OnUndefined,
  Params,
  Post,
  Put,
  Req
} from "routing-controllers";

import { contactsService } from "@beabee/core";

import { login } from "@api/utils";
import {
  CreateResetPasswordDto,
  UpdateResetPasswordDto
} from "@api/dto/ResetPasswordDto";
import { UUIDParams } from "@api/params/UUIDParams";
import currentLocale from "#locale";

@JsonController("/reset-password")
export class ResetPasswordController {
  @OnUndefined(204)
  @Post()
  async create(@Body() data: CreateResetPasswordDto): Promise<void> {
    await contactsService.resetPasswordBegin(
      data.email,
      data.resetUrl,
      currentLocale()
    );
  }

  @OnUndefined(204)
  @Put("/:id")
  async complete(
    @Req() req: Request,
    @Params() { id }: UUIDParams,
    @Body() data: UpdateResetPasswordDto
  ): Promise<void> {
    const contact = await contactsService.resetPasswordComplete(id, data);
    await login(req, contact);
  }
}
