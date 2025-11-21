import {
  ContributionForm,
  ContributionPeriod,
  PaymentForm,
  PaymentMethod,
  PaymentStatus,
} from '@beabee/beabee-common';

import axios from 'axios';
import crypto from 'crypto';
import { differenceInMonths, format } from 'date-fns';
import { Request } from 'express';
import {
  Customer,
  CustomerBankAccount,
  PaymentStatus as GCPaymentStatus,
  Mandate,
  Payment,
  PaymentCurrency,
  RedirectFlow,
  RedirectFlowPrefilledCustomer,
  Refund,
  Subscription,
  SubscriptionIntervalUnit,
} from 'gocardless-nodejs/types/Types';
import moment from 'moment';
import { DeepPartial } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import config from '#config/config';
import { log as mainLogger } from '#logging';
import { getChargeableAmount } from '#utils/payment';

const log = mainLogger.child({ app: 'gocardless-api' });

const gocardlessInstance = axios.create({
  baseURL: `https://${
    config.gocardless.sandbox ? 'api-sandbox' : 'api'
  }.gocardless.com`,
  headers: {
    Authorization: `Bearer ${config.gocardless.accessToken}`,
    'GoCardless-Version': '2015-07-06',
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

gocardlessInstance.interceptors.request.use((config) => {
  log.info(`${config.method} ${config.url}`, {
    params: config.params,
    data: config.data,
  });

  if (config.method === 'post') {
    config.headers['Idempotency-Key'] = uuidv4();
  }
  return config;
});

function isCancellationFailed(error: any) {
  return (
    error.response &&
    error.response.status === 422 &&
    error.response.data.error?.errors?.some(
      (e: any) => e.reason === 'cancellation_failed'
    )
  );
}

gocardlessInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Ignore cancellation_failed errors as it just means the thing was already cancelled
    if (isCancellationFailed(error)) {
      return { data: {} }; // This will never be used but is a bit hacky
    } else {
      log.error(`GoCardless API returned ${error.response.status}`, {
        status: error.response.status,
        data: error.response.data,
      });
      throw error;
    }
  }
);

const STANDARD_METHODS = ['create', 'get', 'update', 'list', 'all'];

interface Methods<T, C> {
  create(data: DeepPartial<C>): Promise<T>;
  list(params?: Record<string, unknown>): Promise<T[]>;
  all(params?: Record<string, unknown>): Promise<T[]>;
  get(id: string, params?: Record<string, unknown>): Promise<T>;
  update(id: string, data: DeepPartial<T>): Promise<T>;
  remove(id: string): Promise<boolean>;
  [key: string]: any;
}

interface Actions<T> {
  cancel(id: string): Promise<T>;
  complete(id: string, data?: Record<string, unknown>): Promise<T>;
}

function createMethods<T, C = T>(
  key: string,
  allowedMethods: string[],
  allowedActions: string[] = []
): Methods<T, C> & Actions<T> {
  const endpoint = `/${key}`;

  const methods: Methods<T, C> = {
    async create(data) {
      const response = await gocardlessInstance.post(endpoint, { [key]: data });
      return <T>response.data[key];
    },
    async list(params) {
      const response = await gocardlessInstance.get(endpoint, { params });
      return <T[]>response.data[key];
    },
    async all(params) {
      const {
        data: { meta, [key]: resources },
      } = await gocardlessInstance.get(endpoint, { params });

      const moreResources = meta.cursors.after
        ? await this.all({ ...params, after: meta.cursors.after })
        : [];

      return <T[]>[...resources, ...moreResources];
    },
    async get(id, params) {
      const response = await gocardlessInstance.get(`${endpoint}/${id}`, {
        params,
      });
      return <T>response.data[key];
    },
    async update(id, data) {
      const response = await gocardlessInstance.put(`${endpoint}/${id}`, {
        [key]: data,
      });
      return <T>response.data[key];
    },
    async remove(id) {
      const response = await gocardlessInstance.delete(`${endpoint}/${id}`);
      return response.status < 300;
    },
  };

  function actionMethod(action: string) {
    return async (id: string, data?: Record<string, unknown>) => {
      const response = await gocardlessInstance.post(
        `${endpoint}/${id}/actions/${action}`,
        { data }
      );
      return response.data[key];
    };
  }

  return Object.assign(
    {},
    ...allowedMethods.map((method) => ({ [method]: methods[method] })),
    ...allowedActions.map((action) => ({ [action]: actionMethod(action) }))
  );
}

interface CreateRedirectFlow extends RedirectFlow {
  prefilled_customer: RedirectFlowPrefilledCustomer;
}

const gocardless = {
  //creditors: createMethods<Creditor>('creditors', STANDARD_METHODS),
  //creditorBankAccounts: createMethods<CreditorBankAccount>('creditor_bank_accounts', ['create', 'get', 'list', 'all'], ['disable']),
  customers: createMethods<Customer>('customers', [
    ...STANDARD_METHODS,
    'remove',
  ]),
  customerBankAccounts: createMethods<CustomerBankAccount>(
    'customer_bank_accounts',
    STANDARD_METHODS,
    ['disable']
  ),
  //events: createMethods<Event>('events', ['get', 'list', 'all']),
  mandates: createMethods<Mandate>('mandates', STANDARD_METHODS, [
    'cancel',
    'reinstate',
  ]),
  //mandateImports: createMethods<MandateImport>('mandate_imports', ['create', 'get'], ['submit', 'cancel']),
  //mandateImportEntries: createMethods<MandateImportEntry>('mandate_import_entries', ['create', 'list', 'all']),
  payments: createMethods<Payment>('payments', STANDARD_METHODS, [
    'cancel',
    'retry',
  ]),
  //payouts: createMethods<Payout>('payouts', ['get', 'list', 'all']),
  //payoutItems: createMethods<PayoutItem>('payout_items', ['list', 'all']),
  redirectFlows: createMethods<RedirectFlow, CreateRedirectFlow>(
    'redirect_flows',
    ['create', 'get'],
    ['complete']
  ),
  refunds: createMethods<Refund>('refunds', STANDARD_METHODS),
  subscriptions: createMethods<Subscription>(
    'subscriptions',
    STANDARD_METHODS,
    ['cancel']
  ),
  webhooks: {
    validate(req: Request): boolean {
      return (
        req.body &&
        req.headers['content-type'] === 'application/json' &&
        req.headers['webhook-signature'] ===
          crypto
            .createHmac('sha256', config.gocardless.secret)
            .update(req.body)
            .digest('hex')
      );
    },
  },
};

export default gocardless;

function getGCChargeableAmount(paymentForm: PaymentForm): string {
  return getChargeableAmount(
    paymentForm,
    PaymentMethod.GoCardlessDirectDebit
  ).toString();
}

async function getNextPendingPayment(query: Record<string, unknown>) {
  // We return the first pending payment we find, so there might be one with a
  // different status that has an earlier charge date, but for our purposes that
  // is fine and this can reduce API calls
  for (const status of [
    GCPaymentStatus.PendingSubmission,
    GCPaymentStatus.Submitted,
    // This one is unlikely so can go last to reduce API calls
    GCPaymentStatus.PendingCustomerApproval,
  ]) {
    const payments = await gocardless.payments.list({
      status,
      limit: 1,
      sort_field: 'charge_date',
      sort_direction: 'asc',
      ...query,
    });
    if (payments.length > 0) {
      return payments[0];
    }
  }
}

export async function getSubscriptionNextChargeDate(
  subscription: Subscription
): Promise<Date> {
  const pendingPayment = await getNextPendingPayment({
    subscription: subscription.id,
    'charge_date[gte]': moment.utc().format('YYYY-MM-DD'),
  });

  // Check for pending payments because subscription.upcoming_payments doesn't
  // include pending payments
  const date = pendingPayment
    ? pendingPayment.charge_date
    : subscription.upcoming_payments![0].charge_date;
  return moment.utc(date).add(config.gracePeriod).toDate();
}

export async function createSubscription(
  mandateId: string,
  form: ContributionForm,
  _startDate?: Date
): Promise<Subscription> {
  let startDate = _startDate && format(_startDate, 'yyyy-MM-dd');
  const chargeableAmount = getGCChargeableAmount(form);
  log.info('Create subscription for ' + mandateId, {
    form,
    startDate,
    chargeableAmount,
  });

  if (startDate) {
    const mandate = await gocardless.mandates.get(mandateId);
    // next_possible_charge_date will always have a value as this is an active mandate
    if (startDate < mandate.next_possible_charge_date!) {
      startDate = mandate.next_possible_charge_date!;
    }
  }

  const subscription = await gocardless.subscriptions.create({
    amount: chargeableAmount,
    currency: config.currencyCode.toUpperCase(),
    interval_unit:
      form.period === ContributionPeriod.Annually
        ? SubscriptionIntervalUnit.Yearly
        : SubscriptionIntervalUnit.Monthly,
    name: 'Membership',
    links: {
      mandate: mandateId,
    },
    ...(startDate && { start_date: startDate }),
  });

  return subscription;
}

export async function updateSubscription(
  subscriptionId: string,
  form: ContributionForm
): Promise<Subscription> {
  const chargeableAmount = getGCChargeableAmount(form);
  const subscription = await gocardless.subscriptions.get(subscriptionId);

  log.info(
    `Update subscription amount for ${subscriptionId} to ${chargeableAmount}`
  );

  // Don't update if it hasn't changed as GoCardless still counts this
  // as one of the 10 updates
  if (subscription.amount !== chargeableAmount) {
    return await gocardless.subscriptions.update(subscriptionId, {
      amount: chargeableAmount,
    });
  } else {
    return subscription;
  }
}

export async function prorateSubscription(
  mandateId: string,
  renewalDate: Date,
  form: ContributionForm,
  lastMonthlyAmount: number
): Promise<boolean> {
  const monthsLeft = Math.max(0, differenceInMonths(renewalDate, new Date()));
  const prorateAmount = (form.monthlyAmount - lastMonthlyAmount) * monthsLeft;

  log.info('Prorate subscription for ' + mandateId, {
    lastMonthlyAmount,
    form,
    monthsLeft,
    prorateAmount,
  });

  if (prorateAmount >= 0) {
    // Amounts of less than 1 can't be charged, just ignore them
    if (prorateAmount < 1) {
      return true;
    } else if (form.prorate) {
      await gocardless.payments.create({
        amount: Math.floor(prorateAmount * 100).toFixed(0),
        currency: config.currencyCode.toUpperCase() as PaymentCurrency,
        description: 'One-off payment to start new contribution',
        links: {
          mandate: mandateId,
        },
      });
      return true;
    }
  }

  return false;
}

export async function hasPendingPayment(mandateId: string): Promise<boolean> {
  return !!(await getNextPendingPayment({ mandate: mandateId }));
}

export function convertStatus(status: GCPaymentStatus): PaymentStatus {
  switch (status) {
    case GCPaymentStatus.PendingCustomerApproval:
      return PaymentStatus.Draft;

    case GCPaymentStatus.PendingSubmission:
    case GCPaymentStatus.Submitted:
      return PaymentStatus.Pending;

    case GCPaymentStatus.Confirmed:
    case GCPaymentStatus.PaidOut:
      return PaymentStatus.Successful;

    case GCPaymentStatus.Failed:
    case GCPaymentStatus.CustomerApprovalDenied:
      return PaymentStatus.Failed;

    case GCPaymentStatus.Cancelled:
    case GCPaymentStatus.ChargedBack:
      return PaymentStatus.Cancelled;
  }
}
