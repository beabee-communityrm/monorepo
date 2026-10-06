import {
  ApiHealthStatus,
  NoneContactSyncIntegrationData,
  SalesforceContactSyncIntegrationData,
} from '@beabee/beabee-common';

import { Equals, IsEnum, IsIn, IsOptional } from 'class-validator';

export enum GetContactSyncIntegrationWith {
  Health = 'health',
}

export class GetContactSyncIntegrationOptsDto {
  @IsOptional()
  @IsEnum(GetContactSyncIntegrationWith, { each: true })
  with?: GetContactSyncIntegrationWith[];
}

export class NoneContactSyncIntegrationDto implements NoneContactSyncIntegrationData {
  @Equals('none')
  provider!: 'none';

  @IsOptional()
  @IsIn([ApiHealthStatus.DISABLED])
  status?: ApiHealthStatus.DISABLED;
}

export class SalesforceContactSyncIntegrationDto implements SalesforceContactSyncIntegrationData {
  @Equals('salesforce')
  provider!: 'salesforce';

  @IsOptional()
  @IsEnum(ApiHealthStatus)
  status?: ApiHealthStatus;
}

export type ContactSyncIntegrationDto =
  | NoneContactSyncIntegrationDto
  | SalesforceContactSyncIntegrationDto;
