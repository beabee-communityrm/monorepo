import {
  disableSalesTaxRate,
  updateSalesTaxRate,
} from '@beabee/core/lib/stripe';

import PartialBody from '@api/decorators/PartialBody';
import {
  GetContentContactsDto,
  GetContentDto,
  GetContentEmailDto,
  GetContentGeneralDto,
  GetContentJoinDto,
  GetContentJoinSetupDto,
  GetContentPaymentDto,
  GetContentProfileDto,
  GetContentShareDto,
  GetContentTelegramDto,
} from '@api/dto';
import { ContentParams } from '@api/params/ContentParams';
import ContentTransformer from '@api/transformers/ContentTransformer';
import {
  Authorized,
  BadRequestError,
  Body,
  Get,
  JsonController,
  Params,
  Patch,
} from 'routing-controllers';

@JsonController('/content')
export class ContentController {
  @Get('/:id(?:*)')
  async get(@Params() { id }: ContentParams): Promise<GetContentDto> {
    return await ContentTransformer.fetchOne(id);
  }

  @Authorized('admin')
  @Patch('/contacts')
  async updateContacts(
    @PartialBody() data: GetContentContactsDto
  ): Promise<GetContentContactsDto> {
    await ContentTransformer.updateOne('contacts', data);
    return ContentTransformer.fetchOne('contacts');
  }

  @Authorized('admin')
  @Patch('/email')
  async updateEmail(
    @PartialBody() data: GetContentEmailDto
  ): Promise<GetContentEmailDto> {
    await ContentTransformer.updateOne('email', data);
    return ContentTransformer.fetchOne('email');
  }

  @Authorized('admin')
  @Patch('/general')
  async updateGeneral(
    @PartialBody() data: GetContentGeneralDto
  ): Promise<GetContentGeneralDto> {
    await ContentTransformer.updateOne('general', data);
    return ContentTransformer.fetchOne('general');
  }

  @Authorized('admin')
  @Patch('/join')
  async updateJoin(
    @PartialBody() data: GetContentJoinDto
  ): Promise<GetContentJoinDto> {
    await ContentTransformer.updateOne('join', data);
    return ContentTransformer.fetchOne('join');
  }

  @Authorized('admin')
  @Patch('/join/setup')
  async updateJoinSetup(
    @PartialBody() data: GetContentJoinSetupDto
  ): Promise<GetContentJoinSetupDto> {
    await ContentTransformer.updateOne('join/setup', data);
    return ContentTransformer.fetchOne('join/setup');
  }

  @Authorized('admin')
  @Patch('/profile')
  async updateProfile(
    @PartialBody() data: GetContentProfileDto
  ): Promise<GetContentProfileDto> {
    await ContentTransformer.updateOne('profile', data);
    return ContentTransformer.fetchOne('profile');
  }

  @Authorized('admin')
  @Patch('/share')
  async updateShare(
    @PartialBody() data: GetContentShareDto
  ): Promise<GetContentShareDto> {
    await ContentTransformer.updateOne('share', data);
    return ContentTransformer.fetchOne('share');
  }

  @Authorized('admin')
  @Patch('/payment')
  async updatePayment(
    @PartialBody() data: GetContentPaymentDto // Should be Partial<GetContentPaymentDto>
  ): Promise<GetContentPaymentDto> {
    if (data.taxRate === null) {
      await disableSalesTaxRate();
    } else if (data.taxRate !== undefined) {
      await updateSalesTaxRate(data.taxRate);
    }

    // taxRate is also stored here to avoid calling external services when
    // fetching the payment content
    await ContentTransformer.updateOne('payment', data);
    return ContentTransformer.fetchOne('payment');
  }

  @Authorized('admin')
  @Patch('/telegram')
  async updateTelegram(
    @PartialBody() data: GetContentTelegramDto
  ): Promise<GetContentTelegramDto> {
    await ContentTransformer.updateOne('telegram', data);
    return ContentTransformer.fetchOne('telegram');
  }
}
