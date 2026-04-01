import { Password } from '@beabee/core/models';
import SignupService from '@beabee/core/services/SignupService';
import { generatePassword } from '@beabee/core/utils/auth';
import { getMonthlyAmount } from '@beabee/core/utils/payment';

import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import {
  BadRequestError,
  Body,
  JsonController,
  NotFoundError,
  OnUndefined,
  Post,
  Req,
  UseBefore,
} from 'routing-controllers';

import { GetContactDto } from '#api/dto/ContactDto';
import {
  AdvancePaymentFlowDto,
  PaymentFlowResultDto,
} from '#api/dto/PaymentFlowDto';
import { StartSignupFlowDto } from '#api/dto/SignupFlowDto';
import { SignupConfirmEmailParams } from '#api/params/SignupConfirmEmailParams';
import ContactTransformer from '#api/transformers/ContactTransformer';
import { login } from '#api/utils/auth';

import { RateLimit } from '../decorators';

@JsonController('/signup')
export class SignupController {
  @OnUndefined(204)
  @Post('/')
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 }, // 5 sign-ups per minute per IP
      user: { points: 5, duration: 60 }, // Same limit for consistency (though authenticated users don't use this endpoint)
    })
  )
  async startSignup(
    @Body() data: StartSignupFlowDto
  ): Promise<PaymentFlowResultDto | undefined> {
    if (data.contribution && data.oneTimePayment) {
      throw new BadRequestError(
        'Cannot start signup with both contribution and one-time payment'
      );
    }

    const signupForm = {
      email: data.email,
      password: data.password
        ? await generatePassword(data.password)
        : Password.none,
      confirmUrl: data.confirmUrl,
      loginUrl: data.loginUrl,
      setPasswordUrl: data.setPasswordUrl,
    };

    if (data.contribution) {
      // Handle a recurring contribution sign up
      const result = await SignupService.startSignupWithPayment(
        signupForm,
        {
          action: 'start-contribution',
          monthlyAmount: getMonthlyAmount(
            data.contribution.amount,
            data.contribution.period
          ),
          payFee: data.contribution.payFee,
          period: data.contribution.period,
        },
        data.contribution.params
      );
      return plainToInstance(PaymentFlowResultDto, result);
    } else if (data.oneTimePayment) {
      // Handle a one-time payment sign up
      const result = await SignupService.startSignupWithPayment(
        signupForm,
        {
          action: 'create-one-time-payment',
          amount: data.oneTimePayment.amount,
          payFee: data.oneTimePayment.payFee,
        },
        data.oneTimePayment.params
      );
      return plainToInstance(PaymentFlowResultDto, result);
    } else {
      // Handle a no-payment sign up
      await SignupService.startSimpleSignup(signupForm);
    }
  }

  @OnUndefined(204)
  @Post('/advance')
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 }, // 5 advances per minute per IP
      user: { points: 5, duration: 60 }, // Same limit for consistency (though authenticated users don't use this endpoint)
    })
  )
  async advanceSignup(@Body() data: AdvancePaymentFlowDto): Promise<void> {
    await SignupService.advanceSignupWithPayment(
      data.paymentFlowId,
      data.advanceParams
    );
  }

  @Post('/complete')
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 }, // 5 confirmations per minute per IP
      user: { points: 5, duration: 60 }, // Same limit for consistency (though authenticated users don't use this endpoint)
    })
  )
  async confirmEmail(
    @Req() req: Request,
    @Body() { joinFlowId }: SignupConfirmEmailParams
  ): Promise<GetContactDto> {
    const contact = await SignupService.completeSignup(joinFlowId);
    if (!contact) {
      throw new NotFoundError();
    }

    await login(req, contact);

    return ContactTransformer.convert(contact, {
      method: 'user',
      contact,
      roles: contact.activeRoles,
    });
  }
}
