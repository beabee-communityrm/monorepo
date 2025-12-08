import {
  ContentContactsData,
  ContentEmailData,
  ContentGeneralData,
  ContentId,
  ContentJoinData,
  ContentJoinPeriodData,
  ContentJoinSetupData,
  ContentPaymentData,
  ContentProfileData,
  ContentShareData,
  ContributionPeriod,
  PaymentMethod,
  PaymentPeriod,
  StripeFeeCountry,
} from '@beabee/beabee-common';
import { Locale } from '@beabee/locale';

import { GetContentTelegramDto } from '@api/dto/ContentTelegramDto';
import { LinkDto } from '@api/dto/LinkDto';
import { NewsletterGroupDto } from '@api/dto/NewsletterDto';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GetContentContactsDto implements ContentContactsData {
  @IsString({ each: true })
  tags!: string[];

  @IsString({ each: true })
  manualPaymentSources!: string[];
}

export class GetContentEmailDto implements ContentEmailData {
  @IsString()
  supportEmail!: string;

  @IsString()
  supportEmailName!: string;

  @IsString()
  footer!: string;
}

export class GetContentGeneralDto implements ContentGeneralData<Locale> {
  @IsString()
  organisationName!: string;

  @IsString()
  logoUrl!: string;

  @IsString()
  siteUrl!: string;

  @IsString()
  supportEmail!: string;

  @IsString()
  privacyLink!: string;

  @IsString()
  termsLink!: string;

  @IsString()
  impressumLink!: string;

  @IsString()
  locale!: Locale;

  @IsObject() // TODO: validate properly
  theme!: object;

  @IsString()
  currencyCode!: string;

  @IsString()
  currencySymbol!: string;

  @IsString()
  backgroundUrl!: string;

  @IsBoolean()
  hideContribution!: boolean;

  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  footerLinks!: LinkDto[];
}

class GetContentJoinPeriodDto implements ContentJoinPeriodData {
  @IsIn([ContributionPeriod.Monthly, ContributionPeriod.Annually, 'one-time'])
  name!: PaymentPeriod;

  @IsNumber({}, { each: true })
  presetAmounts!: number[];
}

export class GetContentJoinDto implements ContentJoinData {
  @IsString()
  title!: string;

  @IsString()
  subtitle!: string;

  @IsNumber()
  initialAmount!: number;

  @IsIn([ContributionPeriod.Monthly, ContributionPeriod.Annually, 'one-time'])
  initialPeriod!: PaymentPeriod;

  @ValidateNested({ each: true })
  @Type(() => GetContentJoinPeriodDto)
  periods!: GetContentJoinPeriodDto[];

  @IsBoolean()
  showNoContribution!: boolean;

  @IsEnum(PaymentMethod, { each: true })
  paymentMethods!: PaymentMethod[];

  @IsNumber()
  minMonthlyAmount!: number;

  @IsBoolean()
  showAbsorbFee!: boolean;

  /** @deprecated Use {@link GetContentPaymentDto.stripePublicKey} instead. */
  @IsString()
  stripePublicKey!: string;

  /** @deprecated Use {@link GetContentPaymentDto.stripeCountry} instead. */
  @IsIn(['eu', 'gb', 'ca'])
  stripeCountry!: StripeFeeCountry;
}

export class GetContentJoinSetupDto implements ContentJoinSetupData {
  @IsString()
  welcome!: string;

  @IsString()
  newsletterText!: string;

  @IsString()
  newsletterOptIn!: string;

  @IsString()
  newsletterTitle!: string;

  @IsBoolean()
  showNewsletterOptIn!: boolean;

  @ValidateNested({ each: true })
  @Type(() => NewsletterGroupDto)
  newsletterGroups!: NewsletterGroupDto[];

  @IsString()
  mailTitle!: string;

  @IsString()
  mailText!: string;

  @IsString()
  mailOptIn!: string;

  @IsBoolean()
  surveyRequired!: boolean;

  @IsString()
  surveyText!: string;

  @IsBoolean()
  showMailOptIn!: boolean;

  @IsString()
  surveySlug!: string;
}

export class GetContentProfileDto implements ContentProfileData {
  @IsString()
  introMessage!: string;
}

export class GetContentShareDto implements ContentShareData {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  image!: string;

  @IsString()
  twitterHandle!: string;
}

export class GetContentPaymentDto implements ContentPaymentData {
  @IsString()
  stripePublicKey!: string;

  @IsIn(['eu', 'gb', 'ca'])
  stripeCountry!: StripeFeeCountry;

  @IsBoolean()
  taxRateEnabled!: boolean;

  @IsBoolean()
  showOneTimeDonation!: boolean;

  @IsNumber()
  taxRate!: number;

  @IsString()
  noticeText!: string;
}

export type GetContentDto<Id extends ContentId = ContentId> =
  Id extends 'contacts'
    ? GetContentContactsDto
    : never | Id extends 'email'
      ? GetContentEmailDto
      : never | Id extends 'general'
        ? GetContentGeneralDto
        : never | Id extends 'join'
          ? GetContentJoinDto
          : never | Id extends 'join/setup'
            ? GetContentJoinSetupDto
            : never | Id extends 'profile'
              ? GetContentProfileDto
              : never | Id extends 'share'
                ? GetContentShareDto
                : never | Id extends 'payment'
                  ? GetContentPaymentDto
                  : never | Id extends 'telegram'
                    ? GetContentTelegramDto
                    : never;
