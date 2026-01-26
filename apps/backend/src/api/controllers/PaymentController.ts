import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import {
  GetPaymentDto,
  GetPaymentInvoiceDto,
  GetPaymentOptsDto,
  ListPaymentsDto,
} from '@api/dto/PaymentDto';
import PaymentTransformer from '@api/transformers/PaymentTransformer';
import { plainToInstance } from 'class-transformer';
import {
  Authorized,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams,
  Redirect,
} from 'routing-controllers';

@JsonController('/payment')
@Authorized()
export class PaymentController {
  @Get('/')
  async getPayments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListPaymentsDto
  ): Promise<PaginatedDto<GetPaymentDto>> {
    return await PaymentTransformer.fetch(auth, query);
  }

  @Get('/:id')
  async getPayment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('id') id: string,
    @QueryParams() query: GetPaymentOptsDto
  ): Promise<GetPaymentDto | undefined> {
    return await PaymentTransformer.fetchOneById(auth, id, query);
  }

  @Get('/:id/invoice')
  @Redirect(':url')
  async getPaymentInvoice(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetPaymentInvoiceDto> {
    const url = await PaymentTransformer.fetchOneInvoiceUrl(auth, id);
    return plainToInstance(GetPaymentInvoiceDto, { url });
  }
}
