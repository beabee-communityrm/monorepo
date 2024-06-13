import { plainToInstance } from "class-transformer";
import { Request } from "express";
import {
  Body,
  JsonController,
  NotFoundError,
  OnUndefined,
  Post,
  Req
} from "routing-controllers";

import { database, generatePassword, paymentFlowService } from "@beabee/core";

import { GetContactDto } from "@api/dto/ContactDto";
import { GetPaymentFlowDto } from "@api/dto/PaymentFlowDto";
import {
  StartSignupFlowDto,
  CompleteSignupFlowDto
} from "@api/dto/SignupFlowDto";
import { SignupConfirmEmailParams } from "@api/params/SignupConfirmEmailParams";
import ContactTransformer from "@api/transformers/ContactTransformer";
import { login } from "@api/utils";

import { JoinFlow, Password } from "@beabee/models";
import currentLocale from "#locale";

@JsonController("/signup")
export class SignupController {
  @OnUndefined(204)
  @Post("/")
  async startSignup(
    @Body() data: StartSignupFlowDto
  ): Promise<GetPaymentFlowDto | undefined> {
    const baseForm = {
      email: data.email,
      password: data.password
        ? await generatePassword(data.password)
        : Password.none
    };

    if (data.contribution) {
      const flow = await paymentFlowService.createPaymentJoinFlow(
        {
          ...baseForm,
          ...data.contribution,
          monthlyAmount: data.contribution.monthlyAmount
        },
        data,
        data.contribution.completeUrl,
        { email: data.email }
      );

      return plainToInstance(GetPaymentFlowDto, flow);
    } else {
      const joinFlow = await paymentFlowService.createJoinFlow(baseForm, data);
      await paymentFlowService.sendConfirmEmail(joinFlow, currentLocale());
    }
  }

  @OnUndefined(204)
  @Post("/complete")
  async completeSignup(@Body() data: CompleteSignupFlowDto): Promise<void> {
    const joinFlow = await paymentFlowService.getJoinFlowByPaymentId(
      data.paymentFlowId
    );
    if (!joinFlow) {
      throw new NotFoundError();
    }

    // Merge additional data into the join form
    if (data.firstname || data.lastname || data.vatNumber) {
      Object.assign(joinFlow.joinForm, data);
      await database.getRepository(JoinFlow).save(joinFlow);
    }

    await paymentFlowService.sendConfirmEmail(joinFlow, currentLocale());
  }

  @Post("/confirm-email")
  async confirmEmail(
    @Req() req: Request,
    @Body() { joinFlowId }: SignupConfirmEmailParams
  ): Promise<GetContactDto> {
    const joinFlow = await database.getRepository(JoinFlow).findOneBy({
      id: joinFlowId
    });
    if (!joinFlow) {
      throw new NotFoundError();
    }

    const contact = await paymentFlowService.completeConfirmEmail(
      joinFlow,
      currentLocale()
    );
    await login(req, contact);

    return ContactTransformer.convert(contact);
  }
}
