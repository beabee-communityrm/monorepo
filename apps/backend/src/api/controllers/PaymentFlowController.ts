import paymentFlowService from '@beabee/core/services/PaymentFlowService';

import { plainToInstance } from 'class-transformer';
import { Get, JsonController, Param } from 'routing-controllers';

import { GetPaymentFlowDto } from '#api/dto/PaymentFlowDto';

@JsonController('/payment-flow')
export class PaymentFlowController {
  @Get('/:id')
  async get(@Param('id') id: string): Promise<GetPaymentFlowDto> {
    const status = await paymentFlowService.getStatus(id);
    return plainToInstance(GetPaymentFlowDto, { status });
  }
}
