import { PaymentStatus, PaymentType } from '@beabee/beabee-common';

import { describe, expect, it } from 'vitest';

import type { StripeLocalPayment, StripePaymentData } from '../types/sync.js';
import {
  classifyInvoicePayments,
  countStatusChanges,
  getMismatchedPaymentFields,
  printPaymentMismatch,
} from './stripe-reconcile.js';

function createData(overrides: Partial<StripePaymentData> = {}) {
  return {
    amount: 25.35,
    chargeDate: new Date('2026-11-16T20:24:14Z'),
    description: '',
    subscriptionId: null,
    status: PaymentStatus.Successful,
    type: PaymentType.OneTime,
    ...overrides,
  };
}

function createPayment(
  id: string,
  overrides: Partial<StripePaymentData> = {}
): StripeLocalPayment {
  return { id, ...createData(overrides) };
}

describe('getMismatchedPaymentFields', () => {
  it('finds no mismatch for equal payment data', () => {
    expect(getMismatchedPaymentFields(createData(), createData())).toEqual([]);
  });

  it('finds every differing field', () => {
    expect(
      getMismatchedPaymentFields(
        createData({ status: PaymentStatus.Draft, amount: 0 }),
        createData()
      )
    ).toEqual(['status', 'amount']);
  });

  it('compares charge dates by time', () => {
    expect(
      getMismatchedPaymentFields(
        createData(),
        createData({ chargeDate: new Date('2026-11-16T20:24:14Z') })
      )
    ).toEqual([]);
    expect(
      getMismatchedPaymentFields(
        createData(),
        createData({ chargeDate: new Date('2026-11-16T20:24:15Z') })
      )
    ).toEqual(['chargeDate']);
  });

  it('ignores amount differences below the stored precision', () => {
    expect(
      getMismatchedPaymentFields(
        createData({ amount: Math.fround(1234567.89) }),
        createData({ amount: 1234567.89 })
      )
    ).toEqual([]);
  });
});

describe('classifyInvoicePayments', () => {
  const contactIdByCustomerId = new Map([['cus_known', 'contact-1']]);

  it('reports a payment that differs from its invoice', () => {
    const payment = createPayment('in_1', { status: PaymentStatus.Draft });
    const data = createData();

    expect(
      classifyInvoicePayments(
        [{ id: 'in_1', customerId: 'cus_known', data }],
        new Map([[payment.id, payment]]),
        contactIdByCustomerId
      )
    ).toEqual({
      mismatches: [{ payment, data, fields: ['status'] }],
      missing: [],
    });
  });

  it('reports nothing for a payment that matches its invoice', () => {
    expect(
      classifyInvoicePayments(
        [{ id: 'in_1', customerId: 'cus_known', data: createData() }],
        new Map([['in_1', createPayment('in_1')]]),
        contactIdByCustomerId
      )
    ).toEqual({ mismatches: [], missing: [] });
  });

  it('reports a mismatch even if the customer is unknown', () => {
    const { mismatches } = classifyInvoicePayments(
      [{ id: 'in_1', customerId: 'cus_unknown', data: createData() }],
      new Map([
        ['in_1', createPayment('in_1', { status: PaymentStatus.Draft })],
      ]),
      contactIdByCustomerId
    );

    expect(mismatches).toHaveLength(1);
  });

  it('reports an invoice without a payment for a known customer', () => {
    const data = createData();

    expect(
      classifyInvoicePayments(
        [{ id: 'in_1', customerId: 'cus_known', data }],
        new Map(),
        contactIdByCustomerId
      )
    ).toEqual({
      mismatches: [],
      missing: [{ id: 'in_1', contactId: 'contact-1', data }],
    });
  });

  it('ignores an invoice without a payment for an unknown customer', () => {
    expect(
      classifyInvoicePayments(
        [
          { id: 'in_1', customerId: 'cus_unknown', data: createData() },
          { id: 'in_2', customerId: null, data: createData() },
        ],
        new Map(),
        contactIdByCustomerId
      )
    ).toEqual({ mismatches: [], missing: [] });
  });
});

describe('printPaymentMismatch', () => {
  it('prints the old and new value of each mismatched field', () => {
    expect(
      printPaymentMismatch({
        payment: createPayment('in_1', {
          status: PaymentStatus.Draft,
          chargeDate: new Date('2026-11-16T20:24:13Z'),
        }),
        data: createData(),
        fields: ['status', 'chargeDate'],
      })
    ).toBe(
      'status=draft→successful, chargeDate=2026-11-16T20:24:13.000Z→2026-11-16T20:24:14.000Z'
    );
  });
});

describe('countStatusChanges', () => {
  it('counts mismatches by status change', () => {
    const draft = createPayment('in_1', { status: PaymentStatus.Draft });
    const data = createData();

    expect(
      countStatusChanges([
        { payment: draft, data, fields: ['status'] },
        { payment: draft, data, fields: ['status', 'amount'] },
        { payment: createPayment('in_2'), data, fields: ['amount'] },
      ])
    ).toEqual(
      new Map([
        ['draft→successful', 2],
        ['status unchanged', 1],
      ])
    );
  });
});
