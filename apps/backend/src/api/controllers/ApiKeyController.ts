import { BadRequestError, NotFoundError } from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import ApiKeyService from '@beabee/core/services/ApiKeyService';
import ContactsService from '@beabee/core/services/ContactsService';
import { AuthInfo } from '@beabee/core/type';

import { plainToInstance } from 'class-transformer';
import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  OnUndefined,
  Param,
  Post,
  QueryParams,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import {
  CreateApiKeyDto,
  GetApiKeyDto,
  ListApiKeysDto,
  NewApiKeyDto,
} from '#api/dto/ApiKeyDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import ApiKeyTransformer from '#api/transformers/ApiKeyTransformer';

@JsonController('/api-key')
@Authorized('admin')
export class ApiKeyController {
  @Get('/')
  async getApiKeys(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListApiKeysDto
  ): Promise<PaginatedDto<GetApiKeyDto>> {
    return await ApiKeyTransformer.fetch(auth, query);
  }

  @Get('/:id')
  async getApiKey(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetApiKeyDto | undefined> {
    return await ApiKeyTransformer.fetchOneById(auth, id);
  }

  @Post('/')
  @Authorized('superadmin')
  async createApiKey(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Body() data: CreateApiKeyDto
  ): Promise<NewApiKeyDto> {
    const token = await ApiKeyService.create(
      await getCreator(auth, data.contactId),
      data.description,
      data.expires
    );

    return plainToInstance(NewApiKeyDto, { token });
  }

  @OnUndefined(204)
  @Delete('/:id')
  async deleteApiKey(@Param('id') id: string): Promise<void> {
    if (!(await ApiKeyService.delete(id))) {
      throw new NotFoundError();
    }
  }
}

/**
 * Operators have no contact of their own, so they name the creator explicitly.
 * Everyone else can only create keys for themselves.
 */
async function getCreator(
  auth: AuthInfo,
  contactId: string | undefined
): Promise<Contact> {
  if (auth.method === 'operator') {
    if (!contactId) {
      throw new BadRequestError('contactId is required with Operator Auth');
    }
    const contact = await ContactsService.findOneBy({ id: contactId });
    if (!contact) {
      throw new NotFoundError();
    }
    return contact;
  }

  if (contactId) {
    throw new BadRequestError('contactId is only allowed with Operator Auth');
  }
  if (!auth.contact) {
    throw new BadRequestError('No contact to create the API key for');
  }
  return auth.contact;
}
