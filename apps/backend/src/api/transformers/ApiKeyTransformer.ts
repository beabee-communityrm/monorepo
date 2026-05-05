import type { ApiKeyFilterName, RoleType } from '@beabee/beabee-common';
import { apiKeyFilters } from '@beabee/beabee-common';
import { ApiKey } from '@beabee/core/models';
import type { AuthInfo } from '@beabee/core/type';

import { TransformPlainToInstance } from 'class-transformer';
import type { SelectQueryBuilder } from 'typeorm';

import { GetApiKeyDto } from '#api/dto/ApiKeyDto';

import { BaseTransformer } from './BaseTransformer.js';
import ContactTransformer, { loadContactRoles } from './ContactTransformer.js';

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
