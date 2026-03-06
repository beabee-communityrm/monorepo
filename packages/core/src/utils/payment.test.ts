import {
  ContributionForm,
  ContributionPeriod,
  ContributionType,
  PaymentMethod,
} from '@beabee/beabee-common';

import { add, sub } from 'date-fns';
import { describe, expect, test } from 'vitest';

import config from '#config/config';
import { Contact, ContactRole, Password } from '#models/index';
import { PaymentFlowFormCreateOneTimePayment } from '#type/payment-flow-form';

import { calcRenewalDate, getChargeableAmount } from './payment';

function createContact(contact?: Partial<Contact>): Contact {
  return Object.assign(new Contact(), {
    referralCode: 'AB123',
    pollsCode: 'AB234',
    roles: [],
    password: Password.none,
    email: 'test@example.com',
    firstname: '',
    lastname: '',
    contributionType: ContributionType.Manual,
    contributionPeriod: ContributionPeriod.Monthly,
    ...contact,
  });
}

function createRole(role?: Partial<ContactRole>): ContactRole {
  return Object.assign(new ContactRole(), {
    type: 'member',
    dateAdded: new Date(),
    ...role,
  });
}

describe('Renewal calculation should be', () => {
  const now = new Date();

  const oneYearAgo = sub(now, { years: 1 });
  const oneMonthAgo = sub(now, { months: 1 });
  const oneMonthFromNow = add(now, { months: 1 });
  const twoYearsFromNow = add(now, { years: 2 });

  test('undefined if contact has no contribution', () => {
    const contact = createContact({ contributionType: ContributionType.None });
    expect(calcRenewalDate(contact, now)).toBeUndefined();
  });

  test('undefined if contact has an inactive membership', () => {
    const contact = createContact({
      roles: [createRole({ dateAdded: oneYearAgo, dateExpires: oneMonthAgo })],
    });
    expect(calcRenewalDate(contact, now)).toBeUndefined();
  });

  test('expiry date minus grace period if membership has an expiry date', () => {
    const contact = createContact({
      contributionType: ContributionType.Manual,
      roles: [
        createRole({ dateAdded: oneYearAgo, dateExpires: oneMonthFromNow }),
      ],
    });
    expect(calcRenewalDate(contact, now)).toEqual(
      sub(oneMonthFromNow, config.gracePeriod)
    );
  });

  test('a maximum of one contribution period if the expiry date is too far in the future', () => {
    const contact = createContact({
      contributionType: ContributionType.Manual,
      contributionPeriod: ContributionPeriod.Annually,
      roles: [
        createRole({ dateAdded: oneYearAgo, dateExpires: twoYearsFromNow }),
      ],
    });
    expect(calcRenewalDate(contact, now)).toEqual(add(now, { years: 1 }));
  });

  test('a month away if the membership has no expiry date and is monthly', () => {
    const contact = createContact({
      roles: [createRole({ dateAdded: oneYearAgo })],
    });
    expect(calcRenewalDate(contact, now)).toEqual(oneMonthFromNow);
  });

  test('next year if the membership has no expiry date, is annual and the date has passed this year', () => {
    const contact = createContact({
      contributionPeriod: ContributionPeriod.Annually,
      roles: [createRole({ dateAdded: sub(oneYearAgo, { days: 5 }) })],
    });
    expect(calcRenewalDate(contact, now)).toEqual(
      add(now, { years: 1, days: -5 })
    );
  });

  test('this year if membership has no expiry date, is annual and date has not passed this year', () => {
    const oneYearAgoAnd5Days = add(oneYearAgo, { days: 5 });
    const contact = createContact({
      contributionPeriod: ContributionPeriod.Annually,
      roles: [createRole({ dateAdded: oneYearAgoAnd5Days })],
    });
    expect(calcRenewalDate(contact, now)).toEqual(
      add(oneYearAgoAnd5Days, { years: 1 })
    );
  });
});

describe('getChargeableAmount', () => {
  test('should calculate correct amount for monthly contribution without fee', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 10,
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );

    expect(result).toBe(1000);
  });

  test('should calculate correct amount for annual contribution without fee', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 10,
      period: ContributionPeriod.Annually,
      payFee: false,
      prorate: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );

    expect(result).toBe(12000);
  });

  test('should ignore fee for annual contribution', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 5,
      period: ContributionPeriod.Annually,
      payFee: true, // Fee shouldn't be applied
      prorate: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'gb'
    );

    expect(result).toBe(6000);
  });

  test('should handle different Stripe payment methods with different fees', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 20,
      period: ContributionPeriod.Monthly,
      payFee: true,
      prorate: false,
    };

    // Test PayPal
    const resultPayPal = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripePayPal,
      'gb'
    );
    expect(resultPayPal).toBe(2050);

    // Test BACS
    const resultBACS = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeBACS,
      'gb'
    );
    expect(resultBACS).toBe(2020);
  });

  test('should handle GoCardless payment method', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 15,
      period: ContributionPeriod.Monthly,
      payFee: true,
      prorate: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.GoCardlessDirectDebit,
      'gb'
    );

    expect(result).toBe(1535);
  });

  test('should round to nearest cent', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 10.333,
      period: ContributionPeriod.Monthly,
      payFee: false,
      prorate: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );

    expect(result).toBe(1000);
  });

  test('should handle different countries', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 25,
      period: ContributionPeriod.Monthly,
      payFee: true,
      prorate: false,
    };

    const resultCA = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'ca'
    );
    expect(resultCA).toBe(2603);

    const resultGB = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'gb'
    );
    expect(resultGB).toBe(2558);

    const resultEU = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );
    expect(resultEU).toBe(2563);
  });

  test('should handle zero fee when payFee is false', () => {
    const paymentForm: ContributionForm = {
      monthlyAmount: 100,
      period: ContributionPeriod.Annually,
      payFee: false, // Key: fee should be ignored
      prorate: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );

    expect(result).toBe(120000);
  });

  test('should calculate correct amount for one-time payment without fee', () => {
    const paymentForm: PaymentFlowFormCreateOneTimePayment = {
      action: 'create-one-time-payment',
      amount: 25,
      payFee: false,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );

    expect(result).toBe(2500);
  });

  test('should include fee for one-time payment when payFee is true', () => {
    const paymentForm: PaymentFlowFormCreateOneTimePayment = {
      action: 'create-one-time-payment',
      amount: 30,
      payFee: true,
    };

    const result = getChargeableAmount(
      paymentForm,
      PaymentMethod.StripeCard,
      'eu'
    );

    expect(result).toBe(3070);
  });
});
