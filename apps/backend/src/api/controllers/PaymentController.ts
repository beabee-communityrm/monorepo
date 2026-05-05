import type { AuthInfo } from '@beabee/core/type';

import type { Response } from 'express';
import {
  Authorized,
  Get,
  JsonController,
  Param,
  QueryParams,
  Res,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import type { GetExportQuery } from '#api/dto';
import type { PaginatedDto } from '#api/dto/PaginatedDto';
import type {
  GetPaymentAggregationDto,
  GetPaymentAggregationOptsDto,
  GetPaymentDto,
  GetPaymentOptsDto,
  ListPaymentsDto,
} from '#api/dto/PaymentDto';
import PaymentExporter from '#api/transformers/PaymentExporter';
import PaymentTransformer from '#api/transformers/PaymentTransformer';

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

  @Get('.csv')
  async exportPayments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: GetExportQuery,
    @Res() res: Response
  ): Promise<Response> {
    const [exportName, exportData] = await PaymentExporter.export(auth, query);
    res.attachment(exportName).send(exportData);
    return res;
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
