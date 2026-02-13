import {
  CalloutAccess,
  CalloutCaptcha,
  CalloutChannel,
  CalloutData,
  CalloutMapSchema,
  CalloutMapSchemaIconStyling,
  CalloutNewsletterSchema,
  CalloutResponseViewSchema,
  ItemStatus,
} from '@beabee/beabee-common';

import { GetPaginatedQuery } from '#api/dto/BaseDto';
import { GetCalloutFormDto, SetCalloutFormDto } from '#api/dto/CalloutFormDto';
import { CalloutVariantDto } from '#api/dto/CalloutVariantDto';
import { LinkDto } from '#api/dto/LinkDto';
import { NewsletterGroupDto } from '#api/dto/NewsletterDto';
import IsLngLat from '#api/validators/IsLngLat';
import IsMapBounds from '#api/validators/IsMapBounds';
import IsSlug from '#api/validators/IsSlug';
import IsUrl from '#api/validators/IsUrl';
import IsVariantsObject from '#api/validators/IsVariantsObject';
import {
  Transform,
  TransformFnParams,
  Type,
  plainToInstance,
} from 'class-transformer';
import {
  Equals,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum GetCalloutWith {
  Form = 'form',
  HasAnswered = 'hasAnswered',
  ResponseCount = 'responseCount',
  ResponseViewSchema = 'responseViewSchema',
  VariantNames = 'variantNames',
  Variants = 'variants',
}

export class GetCalloutOptsDto {
  @IsOptional()
  @IsEnum(GetCalloutWith, { each: true })
  with?: GetCalloutWith[];

  @IsOptional()
  @IsString()
  variant?: string;

  // This property can only be set internally, not via query params
  @Equals(false)
  showHiddenForAll: boolean = false;
}

export class ListCalloutsDto
  extends GetPaginatedQuery
  // Should inherit but can't inherit multiple classes
  implements GetCalloutOptsDto
{
  @IsIn(['title', 'starts', 'expires'])
  sort?: string;

  @IsOptional()
  @IsEnum(GetCalloutWith, { each: true })
  with?: GetCalloutWith[];

  @IsOptional()
  @IsString()
  variant?: string;

  // This property can only be set internally, not via query params
  @Equals(false)
  showHiddenForAll: boolean = false;
}

class CalloutMapSchemaDto implements CalloutMapSchema {
  @IsUrl()
  style!: string;

  @IsLngLat()
  center!: [number, number];

  @IsMapBounds()
  bounds!: [[number, number], [number, number]];

  @IsNumber()
  @Min(0)
  @Max(20)
  minZoom!: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  maxZoom!: number;

  @IsNumber()
  @Min(0)
  @Max(20)
  initialZoom!: number;

  @IsString()
  addressProp!: string;

  @IsString()
  addressPattern!: string;

  @IsString()
  addressPatternProp!: string;

  @IsOptional()
  @IsString()
  geocodeCountries?: string;

  @IsOptional()
  @IsString()
  mapIconProp?: string;

  @IsOptional()
  @IsObject()
  mapIconStyling?: CalloutMapSchemaIconStyling;
}

class CalloutNewsletterSchemaDto implements CalloutNewsletterSchema {
  @IsString()
  title!: string;

  @IsString()
  text!: string;

  @IsString()
  optIn!: string;

  @ValidateNested({ each: true })
  @Type(() => NewsletterGroupDto)
  groups!: NewsletterGroupDto[];
}

class CalloutResponseViewSchemaDto implements CalloutResponseViewSchema {
  @IsArray()
  @IsString({ each: true })
  buckets!: string[];

  @IsString()
  titleProp!: string;

  @IsString()
  imageProp!: string;

  @IsString()
  imageFilter!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links!: LinkDto[];

  @IsBoolean()
  gallery!: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CalloutMapSchemaDto)
  map!: CalloutMapSchemaDto | null;
}

abstract class BaseCalloutDto implements CalloutData {
  @IsOptional()
  @IsSlug()
  slug?: string;

  // TODO: Should be IsUrl but validation fails for draft callouts
  @IsString()
  image!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  starts!: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expires!: Date | null;

  @IsBoolean()
  allowUpdate!: boolean;

  @IsBoolean()
  allowMultiple!: boolean;

  @IsEnum(CalloutAccess)
  access!: CalloutAccess;

  @IsEnum(CalloutCaptcha)
  captcha!: CalloutCaptcha;

  @IsBoolean()
  hidden!: boolean;

  @IsOptional()
  @IsEnum(CalloutChannel, { each: true })
  channels!: CalloutChannel[] | null;

  @IsBoolean()
  sendResponseEmail!: boolean;
}

function transformVariants(
  params: TransformFnParams
): Record<string, CalloutVariantDto> {
  const ret: Record<string, CalloutVariantDto> = {};
  for (const variant in params.value) {
    ret[variant] = plainToInstance(CalloutVariantDto, params.value[variant]);
  }
  return ret;
}

export class CreateCalloutDto extends BaseCalloutDto {
  @ValidateNested()
  @Type(() => SetCalloutFormDto)
  formSchema!: SetCalloutFormDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CalloutNewsletterSchemaDto)
  newsletterSchema!: CalloutNewsletterSchemaDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CalloutResponseViewSchemaDto)
  responseViewSchema?: CalloutResponseViewSchemaDto | null;

  @IsVariantsObject()
  @Transform(transformVariants)
  variants!: Record<string, CalloutVariantDto>;
}

export class GetCalloutDto extends BaseCalloutDto {
  @IsString()
  id!: string;

  @IsEnum(ItemStatus)
  status!: ItemStatus;

  @IsString()
  title!: string;

  @IsString()
  excerpt!: string;

  // with[] form
  @IsOptional()
  @IsString()
  intro?: string;

  @IsOptional()
  @IsString()
  thanksTitle?: string;

  @IsOptional()
  @IsString()
  thanksText?: string;

  @IsOptional()
  @IsUrl()
  thanksRedirect?: string;

  @IsOptional()
  @IsString()
  shareTitle?: string;

  @IsOptional()
  @IsString()
  shareDescription?: string;

  @IsOptional()
  @IsBoolean()
  hasAnswered?: boolean;

  @IsOptional()
  @IsNumber()
  responseCount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GetCalloutFormDto)
  formSchema?: GetCalloutFormDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CalloutNewsletterSchemaDto)
  newsletterSchema?: CalloutNewsletterSchemaDto | null;
  // end with[] form

  // with[] responseViewSchema
  @IsOptional()
  @ValidateNested()
  @Type(() => CalloutResponseViewSchemaDto)
  responseViewSchema?: CalloutResponseViewSchemaDto | null;

  // with[] variants
  @IsOptional()
  @IsVariantsObject()
  @Transform(transformVariants)
  variants?: Record<string, CalloutVariantDto>;

  // with[] variantNames
  @IsOptional()
  @IsString({ each: true })
  variantNames?: string[];
}
