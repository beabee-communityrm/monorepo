import { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';

import type { JoinFormData } from '@type/join-form-data';
import { describe, expect, it } from 'vitest';

import { calcJoinFormTotalAmount } from './payment';

describe('calcJoinFormTotalAmount', () => {
  const baseJoinFormData = {
    email: 'test@example.com',
    prorate: false,
    noContribution: false,
  };

  describe('when payFee is true', () => {
    it('should include a fee for monthly contribution', () => {
      const data: JoinFormData = {
        ...baseJoinFormData,
        amount: 10,
        payFee: true,
        paymentMethod: PaymentMethod.StripeCard,
        period: ContributionPeriod.Monthly,
      };

      const result = calcJoinFormTotalAmount(data, 'eu');

      // EU Stripe card fee: 0.25 + 0.015 * amount = 0.25 + 0.015 * 10 = 0.4
      expect(result).toBe(10.4);
    });

    it('should not include fee for annual contributions', () => {
      const data: JoinFormData = {
        ...baseJoinFormData,
        amount: 100,
        payFee: true,
        paymentMethod: PaymentMethod.StripeCard,
        period: ContributionPeriod.Annually,
      };

      const result = calcJoinFormTotalAmount(data, 'eu');

      // Annual contributions don't have fees
      expect(result).toBe(100);
    });

    it('should include a fee for one-time payments', () => {
      const data: JoinFormData = {
        ...baseJoinFormData,
        amount: 50,
        payFee: true,
        paymentMethod: PaymentMethod.StripeCard,
        period: 'one-time',
      };

      const result = calcJoinFormTotalAmount(data, 'eu');

      // EU Stripe card fee: 0.25 + 0.015 * 50 = 1
      expect(result).toBe(51);
    });
  });

  describe('when payFee is false', () => {
    it('should not include any fee for monthly contributions', () => {
      const data: JoinFormData = {
        ...baseJoinFormData,
        amount: 15,
        payFee: false,
        paymentMethod: PaymentMethod.StripeCard,
        period: ContributionPeriod.Monthly,
      };

      const result = calcJoinFormTotalAmount(data, 'eu');

      expect(result).toBe(15);
    });

    it('should not include any fee for annual contributions', () => {
      const data: JoinFormData = {
        ...baseJoinFormData,
        amount: 120,
        payFee: false,
        paymentMethod: PaymentMethod.StripeCard,
        period: ContributionPeriod.Annually,
      };

      const result = calcJoinFormTotalAmount(data, 'eu');

      expect(result).toBe(120);
    });
    it('should not include any fee for one-time payments', () => {
      const data: JoinFormData = {
        ...baseJoinFormData,
        amount: 75,
        payFee: false,
        paymentMethod: PaymentMethod.StripeCard,
        period: 'one-time',
      };

      const result = calcJoinFormTotalAmount(data, 'eu');

      expect(result).toBe(75);
    });
  });
});
