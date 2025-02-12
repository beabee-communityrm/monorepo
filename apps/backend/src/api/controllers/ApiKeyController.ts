import { plainToInstance } from "class-transformer";
import {
  JsonController,
  Authorized,
  Post,
  CurrentUser,
  Get,
  QueryParams,
  Body,
  OnUndefined,
  NotFoundError,
  Delete,
  Param
} from "routing-controllers";

import ApiKeyService from "@beabee/core/services/ApiKeyService";

import { CurrentAuth } from "@api/decorators/CurrentAuth";
import {
  CreateApiKeyDto,
  GetApiKeyDto,
  ListApiKeysDto,
  NewApiKeyDto
} from "@beabee/core/api/dto/ApiKeyDto";
import { PaginatedDto } from "@beabee/core/api/dto/PaginatedDto";
import { apiKeyTransformer } from "@beabee/core/api/transformers";

import { Contact } from "@beabee/core/models";

import { AuthInfo } from "@beabee/core/type";

@JsonController("/api-key")
@Authorized("admin")
export class ApiKeyController {
  @Get("/")
  async getApiKeys(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListApiKeysDto
  ): Promise<PaginatedDto<GetApiKeyDto>> {
    return await apiKeyTransformer.fetch(auth, query);
  }

  @Get("/:id")
  async getApiKey(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Param("id") id: string
  ): Promise<GetApiKeyDto | undefined> {
    return await apiKeyTransformer.fetchOneById(auth, id);
  }

  @Post("/")
  @Authorized("superadmin")
  async createApiKey(
    @CurrentUser({ required: true }) creator: Contact,
    @Body() data: CreateApiKeyDto
  ): Promise<NewApiKeyDto> {
    const token = await ApiKeyService.create(
      creator,
      data.description,
      data.expires
    );

    return plainToInstance(NewApiKeyDto, { token });
  }

  @OnUndefined(204)
  @Delete("/:id")
  async deleteApiKey(@Param("id") id: string): Promise<void> {
    if (!(await ApiKeyService.delete(id))) {
      throw new NotFoundError();
    }
  }
}
