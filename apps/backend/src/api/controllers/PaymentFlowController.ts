import paymentFlowService from '@beabee/core/services/PaymentFlowService';

import { Get, JsonController, Param } from 'routing-controllers';

@JsonController('/payment-flow')
export class PaymentFlowController {
  @Get('/:id')
  async get(@Param('id') id: string): Promise<string> {
    return paymentFlowService.getStatus(id);
  }
}
