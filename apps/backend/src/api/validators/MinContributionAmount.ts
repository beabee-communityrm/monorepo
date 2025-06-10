import { ContributionPeriod, isPeriod } from '@beabee/beabee-common';
import OptionsService from '@beabee/core/services/OptionsService';

import {
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
  buildMessage,
  isNumber,
} from 'class-validator';

function getMinAmount(period: ContributionPeriod) {
  const minMonthlyAmount = OptionsService.getInt(
    'contribution-min-monthly-amount'
  );

  return period === ContributionPeriod.Monthly
    ? minMonthlyAmount
    : minMonthlyAmount * 12;
}

function getPeriod(
  args: ValidationArguments | undefined
): ContributionPeriod | undefined {
  return args &&
    'period' in args.object &&
    args.object.period &&
    isPeriod(args.object.period)
    ? args.object.period
    : undefined;
}

export default function MinContributionAmount(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'minContributionAmount',
      validator: {
        validate: (value, args) => {
          const period = getPeriod(args);
          return !!period && isNumber(value) && value >= getMinAmount(period);
        },
        defaultMessage: buildMessage((eachPrefix, args) => {
          const period = getPeriod(args);
          return period
            ? eachPrefix + `$property must be at least ${getMinAmount(period)}`
            : eachPrefix + `must have a valid period`;
        }, validationOptions),
      },
    },
    validationOptions
  );
}
