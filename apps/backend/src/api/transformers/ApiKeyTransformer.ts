import {
  ApiKeyFilterName,
  RoleType,
  apiKeyFilters,
} from '@beabee/beabee-common';
import { ApiKey } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

import { GetApiKeyDto } from '#api/dto/ApiKeyDto';

import { BaseTransformer } from './BaseTransformer';
import ContactTransformer, { loadContactRoles } from './ContactTransformer';

class ApiKeyTransformer extends BaseTransformer<
  ApiKey,
  GetApiKeyDto,
  ApiKeyFilterName
> {
  protected model = ApiKey;
  protected filters = apiKeyFilters;

  @TransformPlainToInstance(GetApiKeyDto)
  convert(key: ApiKey, auth: AuthInfo): GetApiKeyDto {
    return {
      id: key.id,
      description: key.description,
      expires: key.expires,
      creator: ContactTransformer.convert(key.creator, auth),
      createdAt: key.createdAt,
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<ApiKey>,
    fieldPrefix: string
  ): void {
    qb.leftJoinAndSelect(`${fieldPrefix}creator`, 'creator');
  }

  protected modifyItems(keys: ApiKey[]): Promise<void> {
    return loadContactRoles(keys.map((key) => key.creator));
  }
}

export default new ApiKeyTransformer();
