import { Password } from '@beabee/core/models';
import PaymentFlowService from '@beabee/core/services/PaymentFlowService';
import { generatePassword } from '@beabee/core/utils/auth';
import { getMonthlyAmount } from '@beabee/core/utils/payment';

import { GetContactDto } from '@api/dto/ContactDto';
import {
  CompletePaymentFlowDto,
  PaymentFlowResultDto,
  plainPaymentFlowResultToDto,
} from '@api/dto/PaymentFlowDto';
import {
  CompleteSignupFlowDto,
  StartSignupFlowDto,
} from '@api/dto/SignupFlowDto';
import { SignupConfirmEmailParams } from '@api/params/SignupConfirmEmailParams';
import ContactTransformer from '@api/transformers/ContactTransformer';
import { login } from '@api/utils/auth';
import { Request } from 'express';
import {
  BadRequestError,
  Body,
  JsonController,
  OnUndefined,
  Post,
  Req,
  UseBefore,
} from 'routing-controllers';

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

    const baseForm = {
      email: data.email,
      password: data.password
        ? await generatePassword(data.password)
        : Password.none,
    };

    if (data.contribution) {
      // Handle a recurring contribution sign up
      const result = await PaymentFlowService.startPaymentRegistration(
        {
          ...baseForm,
          ...data.contribution,
          monthlyAmount: getMonthlyAmount(
            data.contribution.amount,
            data.contribution.period
          ),
        },
        data,
        data.contribution.paymentFlowParams
        // { email: data.email } TODO: think about this?
      );
      return plainPaymentFlowResultToDto(result);
    } else if (data.oneTimePayment) {
      // Handle a one-time payment sign up
      const result = await PaymentFlowService.startPaymentRegistration(
        {
          ...baseForm,
          ...data.oneTimePayment,
          monthlyAmount: data.oneTimePayment.amount,
          period: 'one-time',
          prorate: false,
        },
        data,
        data.oneTimePayment.paymentFlowParams
        // { email: data.email } TODO: think about this?
      );
      return plainPaymentFlowResultToDto(result);
    } else {
      // Handle a no-payment sign up
      await PaymentFlowService.startSimpleRegistration(baseForm, data);
    }
  }

  @OnUndefined(204)
  @Post('/complete')
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 }, // 5 completions per minute per IP
      user: { points: 5, duration: 60 }, // Same limit for consistency (though authenticated users don't use this endpoint)
    })
  )
  async completeSignup(@Body() data: CompletePaymentFlowDto): Promise<void> {
    await PaymentFlowService.advancePaymentRegistration(data.paymentFlowId);
  }

  @Post('/confirm-email')
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 }, // 5 confirmations per minute per IP
      user: { points: 5, duration: 60 }, // Same limit for consistency (though authenticated users don't use this endpoint)
    })
  )
  async confirmEmail(
    @Req() req: Request,
    @Body() { flowId }: SignupConfirmEmailParams
  ): Promise<GetContactDto> {
    const contact = await PaymentFlowService.finalizeRegistration(flowId);
    await login(req, contact);

    return ContactTransformer.convert(contact, {
      method: 'user',
      contact,
      roles: contact.activeRoles,
    });
  }
}
