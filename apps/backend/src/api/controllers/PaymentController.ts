import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import {
  GetPaymentAggregationDto,
  GetPaymentAggregationOptsDto,
  GetPaymentDto,
  GetPaymentOptsDto,
  ListPaymentsDto,
} from '@api/dto/PaymentDto';
import PaymentTransformer from '@api/transformers/PaymentTransformer';
import { Response } from 'express';
import {
  Authorized,
  Get,
  JsonController,
  Param,
  QueryParams,
  Res,
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

  @Get('/aggregate')
  async getPaymentAggregation(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: GetPaymentAggregationOptsDto
  ): Promise<GetPaymentAggregationDto> {
    return await PaymentTransformer.fetchAggregation(auth, query);
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
  async getPaymentInvoice(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response> {
    const url = await PaymentTransformer.fetchOneInvoiceUrl(auth, id);
    res.redirect(url);
    return res;
  }
}
