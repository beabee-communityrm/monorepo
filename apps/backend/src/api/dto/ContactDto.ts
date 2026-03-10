import {
  ContributionPeriod,
  ContributionType,
  GetContactWith,
  MembershipStatus,
  NewsletterStatus,
  PaymentSource,
  RoleType,
  RoleTypes,
} from '@beabee/beabee-common';
import { ContributionInfo } from '@beabee/core/type';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';

import { GetPaginatedQuery, GetPaginatedRuleGroup } from '#api/dto/BaseDto';
import {
  GetContactProfileDto,
  UpdateContactProfileDto,
} from '#api/dto/ContactProfileDto';
import {
  CreateContactRoleDto,
  GetContactRoleDto,
} from '#api/dto/ContactRoleDto';
import { GetContactTagDto } from '#api/dto/ContactTagDto';
import { ForceUpdateContributionDto } from '#api/dto/ContributionDto';
import IsPassword from '#api/validators/IsPassword';

const contactSortFields = [
  'firstname',
  'lastname',
  'email',
  'joined',
  'lastSeen',
  'contributionMonthlyAmount',
  'membershipStarts',
  'membershipExpires',
] as const;

export class GetContactOptsDto {
  @IsArray()
  @IsOptional()
  @IsEnum(GetContactWith, { each: true })
  with?: GetContactWith[];
}

export class ListContactsDto extends GetPaginatedQuery {
  @IsArray()
  @IsOptional()
  @IsEnum(GetContactWith, { each: true })
  with?: GetContactWith[];

  @IsIn(contactSortFields)
  sort?: string;
}

export class GetContributionInfoDto implements ContributionInfo {
  @IsEnum(ContributionType)
  type!: ContributionType;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  nextAmount?: number;

  @IsOptional()
  @IsEnum(ContributionPeriod)
  period?: ContributionPeriod;

  @IsOptional()
  @IsDate()
  cancellationDate?: Date;

  @IsOptional()
  @IsDate()
  renewalDate?: Date;

  @IsOptional()
  @IsObject() // TODO: validate properly
  paymentSource?: PaymentSource;

  @IsOptional()
  @IsBoolean()
  payFee?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPendingPayment?: boolean;

  @IsEnum(MembershipStatus)
  membershipStatus!: MembershipStatus;

  @IsOptional()
  @IsDate()
  membershipExpiryDate?: Date;
}

class BaseContactDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstname!: string;

  @IsString()
  lastname!: string;
}

export class GetContactDto extends BaseContactDto {
  @IsString()
  id!: string;

  @IsDate()
  joined!: Date;

  @IsOptional()
  @IsDate()
  lastSeen?: Date;

  @IsOptional()
  @IsNumber()
  contributionAmount?: number;

  @IsOptional()
  @IsEnum(ContributionPeriod)
  contributionPeriod?: ContributionPeriod;

  @IsArray()
  @IsIn(RoleTypes, { each: true })
  activeRoles!: RoleType[];

  @IsOptional()
  @ValidateNested()
  @Type(() => GetContributionInfoDto)
  contribution?: GetContributionInfoDto;

  @IsOptional()
  @ValidateNested()
  profile?: GetContactProfileDto;

  @IsOptional()
  @ValidateNested()
  roles?: GetContactRoleDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  tags?: GetContactTagDto[];

  @IsOptional()
  @IsBoolean()
  isReviewer?: boolean;
}

export class UpdateContactDto extends BaseContactDto {
  @IsOptional()
  @Validate(IsPassword)
  password?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContactProfileDto)
  profile?: UpdateContactProfileDto;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateContactDto extends UpdateContactDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ForceUpdateContributionDto)
  contribution?: ForceUpdateContributionDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateContactRoleDto)
  roles?: CreateContactRoleDto[];

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}

export interface ExportContactDto {
  Id: string;
  EmailAddress: string;
  FirstName: string;
  LastName: string;
  Joined: string;
  Tags: string;
  ContributionType: ContributionType;
  ContributionMonthlyAmount: number | null;
  ContributionPeriod: ContributionPeriod | null;
  ContributionDescription: string;
  ContributionCancelled: string;
  MembershipStarts: string;
  MembershipExpires: string;
  MembershipStatus: MembershipStatus;
  NewsletterStatus: NewsletterStatus;
  DeliveryOptIn: boolean;
  DeliveryAddressLine1: string;
  DeliveryAddressLine2: string;
  DeliveryAddressCity: string;
  DeliveryAddressPostcode: string;
}

/**
 * DTO for batch update request on contacts.
 * Combines filter rules with update operations.
 *
 * @example
 * {
 *   "rules": {
 *     "condition": "OR",
 *     "rules": [
 *       { "field": "id", "operator": "equal", "value": ["id1"] },
 *       { "field": "id", "operator": "equal", "value": ["id2"] }
 *     ]
 *   },
 *   "updates": {
 *     "tags": ["+tag1", "-tag2"]
 *   }
 * }
 *
 * The rules determine which contacts will be updated,
 * while updates specify what changes to apply to the matched contacts.
 *
 * @see GetPaginatedRuleGroup for available filter rules
 * @see BatchUpdateContactUpdatesDto for available update operations
 */
export class BatchUpdateContactDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => GetPaginatedRuleGroup)
  rules!: GetPaginatedRuleGroup;

  @ValidateNested()
  @Type(() => BatchUpdateContactUpdatesDto)
  updates!: Partial<BatchUpdateContactUpdatesDto>;
}

/**
 * Response DTO for batch update operations.
 * Contains the number of contacts that were affected by the update.
 *
 * @example
 * {
 *   "affected": 42  // Number of contacts that were updated
 * }
 *
 * Note: The affected count includes all contacts that matched the filter rules,
 * even if some of them didn't require changes (e.g., already had the tags).
 */
export class BatchUpdateContactResultDto {
  @IsNumber()
  affected!: number;
}

/**
 * DTO for batch update operations on contacts.
 * Currently limited to tag operations only for safety and simplicity.
 *
 * Tag updates use a prefix syntax:
 * - '+tagId' to add a tag
 * - '-tagId' to remove a tag
 *
 * @example
 * {
 *   "tags": [
 *     "+tag1",  // Add tag1
 *     "+tag2",  // Add tag2
 *     "-tag3"   // Remove tag3
 *   ]
 * }
 *
 * Note: This DTO is intentionally restricted to tag operations.
 * When extending with additional properties in the future, consider:
 * - Security implications of batch operations
 * - Performance impact on the database
 * - Data validation requirements
 * - Atomic operation guarantees
 *
 * @see BatchUpdateContactDto for the complete batch update request structure
 */
export class BatchUpdateContactUpdatesDto {
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
