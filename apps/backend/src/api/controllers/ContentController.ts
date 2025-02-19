import {
  Authorized,
  Body,
  Get,
  JsonController,
  Params,
  Patch,
  BadRequestError
} from "routing-controllers";

import PartialBody from "@api/decorators/PartialBody";
import {
  GetContentContactsDto,
  GetContentDto,
  GetContentEmailDto,
  GetContentGeneralDto,
  GetContentJoinDto,
  GetContentJoinSetupDto,
  GetContentProfileDto,
  GetContentShareDto,
  GetContentPaymentDto,
  GetContentTelegramDto
} from "@beabee/core/api/dto";
import { ContentParams } from "@api/params/ContentParams";
import { contentTransformer } from "@beabee/core/api/transformers";
import {
  disableSalesTaxRate,
  updateSalesTaxRate
} from "@beabee/core/lib/stripe";

@JsonController("/content")
export class ContentController {
  @Get("/:id(?:*)")
  async get(@Params() { id }: ContentParams): Promise<GetContentDto> {
    return await contentTransformer.fetchOne(id);
  }

  @Authorized("admin")
  @Patch("/contacts")
  async updateContacts(
    @PartialBody() data: GetContentContactsDto
  ): Promise<GetContentContactsDto> {
    await contentTransformer.updateOne("contacts", data);
    return contentTransformer.fetchOne("contacts");
  }

  @Authorized("admin")
  @Patch("/email")
  async updateEmail(
    @PartialBody() data: GetContentEmailDto
  ): Promise<GetContentEmailDto> {
    await contentTransformer.updateOne("email", data);
    return contentTransformer.fetchOne("email");
  }

  @Authorized("admin")
  @Patch("/general")
  async updateGeneral(
    @PartialBody() data: GetContentGeneralDto
  ): Promise<GetContentGeneralDto> {
    await contentTransformer.updateOne("general", data);
    return contentTransformer.fetchOne("general");
  }

  @Authorized("admin")
  @Patch("/join")
  async updateJoin(
    @PartialBody() data: GetContentJoinDto
  ): Promise<GetContentJoinDto> {
    await contentTransformer.updateOne("join", data);
    return contentTransformer.fetchOne("join");
  }

  @Authorized("admin")
  @Patch("/join/setup")
  async updateJoinSetup(
    @PartialBody() data: GetContentJoinSetupDto
  ): Promise<GetContentJoinSetupDto> {
    await contentTransformer.updateOne("join/setup", data);
    return contentTransformer.fetchOne("join/setup");
  }

  @Authorized("admin")
  @Patch("/profile")
  async updateProfile(
    @PartialBody() data: GetContentProfileDto
  ): Promise<GetContentProfileDto> {
    await contentTransformer.updateOne("profile", data);
    return contentTransformer.fetchOne("profile");
  }

  @Authorized("admin")
  @Patch("/share")
  async updateShare(
    @PartialBody() data: GetContentShareDto
  ): Promise<GetContentShareDto> {
    await contentTransformer.updateOne("share", data);
    return contentTransformer.fetchOne("share");
  }

  @Authorized("admin")
  @Patch("/payment")
  async updatePayment(
    @PartialBody() data: GetContentPaymentDto // Should be Partial<GetContentPaymentDto>
  ): Promise<GetContentPaymentDto> {
    if (data.taxRateEnabled === false) {
      await disableSalesTaxRate();
    } else if (data.taxRateEnabled === true) {
      if (data.taxRate === undefined) {
        throw new BadRequestError(
          "taxRate must be provided when taxRateEnabled is true"
        );
      }
      await updateSalesTaxRate(data.taxRate);
    }

    await contentTransformer.updateOne("payment", data);
    return contentTransformer.fetchOne("payment");
  }

  @Authorized("admin")
  @Patch("/telegram")
  async updateTelegram(
    @PartialBody() data: GetContentTelegramDto
  ): Promise<GetContentTelegramDto> {
    await contentTransformer.updateOne("telegram", data);
    return contentTransformer.fetchOne("telegram");
  }
}
