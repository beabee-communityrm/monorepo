import {
  Authorized,
  Get,
  JsonController,
  Param,
  QueryParams
} from "routing-controllers";

import { CurrentAuth } from "@api/decorators/CurrentAuth";
import {
  GetPaymentDto,
  GetPaymentOptsDto,
  ListPaymentsDto,
  PaginatedDto
} from "@beabee/core/api/dto";
import PaymentTransformer from "@beabee/core/api/transformers/PaymentTransformer";

import { AuthInfo } from "@beabee/core/type";

@JsonController("/payment")
@Authorized()
export class PaymentController {
  @Get("/")
  async getPayments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListPaymentsDto
  ): Promise<PaginatedDto<GetPaymentDto>> {
    return await PaymentTransformer.fetch(auth, query);
  }

  @Get("/:id")
  async getPayment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("id") id: string,
    @QueryParams() query: GetPaymentOptsDto
  ): Promise<GetPaymentDto | undefined> {
    return await PaymentTransformer.fetchOneById(auth, id, query);
  }
}
