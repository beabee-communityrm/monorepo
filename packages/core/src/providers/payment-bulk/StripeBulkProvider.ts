import { setTimeout } from 'node:timers/promises';

import { Stripe, convertInvoiceToPayment, stripe } from '#lib/stripe';
import { log as mainLogger } from '#logging';
import type { ContactContribution } from '#models/index';
import type {
  PaymentBulkFetchContributionsOpts,
  PaymentBulkFetchPaymentsOpts,
  PaymentBulkProvider,
  ProviderContributionResult,
  ProviderContributionState,
  ProviderCustomerState,
  ProviderMandateState,
  ProviderPayment,
  ProviderSubscriptionState,
} from '#type/index';
import { getCreatedWindows } from '#utils/stripe';

const log = mainLogger.child({ app: 'stripe-bulk-provider' });

const MAX_RATE_LIMIT_RETRIES = 5;

/** The number of invoice lists fetched at the same time */
const INVOICE_LIST_CONCURRENCY = 4;

function isResourceMissingError(e: unknown): boolean {
  return (
    e instanceof Stripe.errors.StripeError && e.code === 'resource_missing'
  );
}

/**
 * Runs a Stripe request, waiting and trying again while it is rate limited
 *
 * @param request The Stripe request
 */
async function retryRateLimited<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (e) {
      if (
        !(e instanceof Stripe.errors.StripeRateLimitError) ||
        attempt === MAX_RATE_LIMIT_RETRIES
      ) {
        throw e;
      }
      // Exponential backoff with jitter, as Stripe asks for
      await setTimeout(2 ** attempt * 1000 + Math.random() * 1000);
    }
  }
}

/**
 * Fetch a Stripe list, a page at a time
 *
 * Pages by cursor instead of using the SDK's auto-pagination, which does not
 * retry a rate limited request: one rate limit would end the listing and it
 * would have to start again from the first page.
 *
 * @param list Requests the page of the list at the given cursor
 */
async function* fetchPages<T extends { id: string }>(
  list: (page: Stripe.PaginationParams) => Promise<Stripe.ApiList<T>>
): AsyncGenerator<T[]> {
  let startingAfter: string | undefined;
  do {
    const page = await retryRateLimited(() =>
      list({
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      })
    );
    yield page.data;
    startingAfter = page.has_more ? page.data.at(-1)?.id : undefined;
  } while (startingAfter);
}

/**
 * Fetch a whole Stripe list and keep the objects with the given ids. The
 * Stripe account can be shared with other integrations, so only objects
 * linked to our own data are ours.
 *
 * @param name The name of the objects, for the log
 * @param ids The ids of the objects to keep
 * @param list Requests the page of the list at the given cursor
 * @returns The kept objects by id
 */
async function fetchKnown<T extends { id: string }>(
  name: string,
  ids: Set<string | null>,
  list: (page: Stripe.PaginationParams) => Promise<Stripe.ApiList<T>>
): Promise<Map<string, T>> {
  log.info(`📡 Fetching Stripe ${name}...`);
  const known = new Map<string, T>();
  let fetched = 0;
  for await (const page of fetchPages(list)) {
    for (const item of page) {
      if (ids.has(item.id)) {
        known.set(item.id, item);
      }
    }
    fetched += page.length;
    log.info(`  • Fetched ${fetched} ${name}`);
  }
  return known;
}

/**
 * Converts a Stripe invoice to the payment it should be stored as
 *
 * @param invoice The Stripe invoice
 */
function toProviderPayment(invoice: Stripe.Invoice): ProviderPayment {
  return {
    id: invoice.id,
    customerId:
      typeof invoice.customer === 'string'
        ? invoice.customer
        : invoice.customer?.id || null,
    data: convertInvoiceToPayment(invoice),
  };
}

/**
 * @param subscriptionId The Stripe subscription ID
 * @param listed The subscription if it was already fetched
 */
async function getSubscriptionState(
  subscriptionId: string,
  listed: Stripe.Subscription | undefined
): Promise<ProviderSubscriptionState> {
  try {
    const subscription =
      listed ||
      (await retryRateLimited(() =>
        stripe.subscriptions.retrieve(subscriptionId)
      ));
    switch (subscription.status) {
      case 'canceled':
        return {
          status: 'cancelled',
          cancelledAt: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : new Date(),
        };
      case 'incomplete_expired':
        return { status: 'expired' };
      default:
        return { status: 'active' };
    }
  } catch (e) {
    if (isResourceMissingError(e)) {
      return { status: 'missing' };
    }
    throw e;
  }
}

/**
 * @param mandateId The Stripe payment method ID
 * @param customer The customer if it was already fetched
 */
async function getMandateState(
  mandateId: string,
  customer: Stripe.Customer | undefined
): Promise<ProviderMandateState> {
  // A customer's default payment method is attached to that customer
  if (customer?.invoice_settings.default_payment_method === mandateId) {
    return 'attached';
  }

  try {
    const paymentMethod = await retryRateLimited(() =>
      stripe.paymentMethods.retrieve(mandateId)
    );
    return paymentMethod.customer ? 'attached' : 'detached';
  } catch (e) {
    if (isResourceMissingError(e)) {
      return 'missing';
    }
    throw e;
  }
}

/**
 * @param customerId The Stripe customer ID
 * @param listed The customer if it was already fetched
 */
async function getCustomerState(
  customerId: string,
  listed: Stripe.Customer | undefined
): Promise<ProviderCustomerState> {
  try {
    const customer =
      listed ||
      (await retryRateLimited(() => stripe.customers.retrieve(customerId)));
    return customer.deleted ? 'deleted' : 'active';
  } catch (e) {
    if (isResourceMissingError(e)) {
      return 'missing';
    }
    throw e;
  }
}

export class StripeBulkProvider implements PaymentBulkProvider {
  async fetchContributionStates(
    contributions: ContactContribution[],
    opts: PaymentBulkFetchContributionsOpts
  ): Promise<Map<string, ProviderContributionResult>> {
    // Listing the whole account takes far fewer requests than retrieving
    // each object, so only retrieve them all one by one for specific
    // contacts. An object missing from a list is still retrieved, so nothing
    // is removed on the word of a list alone.
    const subscriptions =
      opts.subscriptions && !opts.partial
        ? await fetchKnown(
            'subscriptions',
            new Set(contributions.map((c) => c.subscriptionId)),
            (page) => stripe.subscriptions.list({ status: 'all', ...page })
          )
        : new Map<string, Stripe.Subscription>();
    const customers =
      (opts.mandates || opts.customers) && !opts.partial
        ? await fetchKnown(
            'customers',
            new Set(contributions.map((c) => c.customerId)),
            (page) => stripe.customers.list(page)
          )
        : new Map<string, Stripe.Customer>();

    const results = new Map<string, ProviderContributionResult>();
    for (const contribution of contributions) {
      const { subscriptionId, mandateId, customerId } = contribution;
      const customer = customerId ? customers.get(customerId) : undefined;
      try {
        const state: ProviderContributionState = {};
        if (subscriptionId && opts.subscriptions) {
          state.subscription = await getSubscriptionState(
            subscriptionId,
            subscriptions.get(subscriptionId)
          );
        }
        if (mandateId && opts.mandates) {
          state.mandate = await getMandateState(mandateId, customer);
        }
        if (customerId && opts.customers) {
          state.customer = await getCustomerState(customerId, customer);
        }
        results.set(contribution.contactId, { state });
      } catch (error) {
        results.set(contribution.contactId, { error });
      }
    }
    return results;
  }

  async fetchPayments(
    opts: PaymentBulkFetchPaymentsOpts
  ): Promise<ProviderPayment[]> {
    const window: Stripe.InvoiceListParams =
      opts.since || opts.until
        ? {
            created: {
              ...(opts.since && {
                gte: Math.floor(opts.since.getTime() / 1000),
              }),
              ...(opts.until && {
                lte: Math.floor(opts.until.getTime() / 1000),
              }),
            },
          }
        : {};
    // Listing the whole account takes far fewer requests than listing each
    // customer, so only list by customer when limited to specific customers.
    // The account is listed a month at a time: one list can only be read page
    // after page, separate months can be fetched at the same time.
    const filters: Stripe.InvoiceListParams[] = opts.customerIds
      ? opts.customerIds.map((customer) => ({ ...window, customer }))
      : getCreatedWindows(opts.oldest, new Date(), opts.since, opts.until).map(
          (created) => (Object.keys(created).length > 0 ? { created } : {})
        );

    log.info(`📡 Fetching Stripe invoices in ${filters.length} lists...`);
    const payments: ProviderPayment[] = [];
    const queue = [...filters];
    let done = 0;
    await Promise.all(
      Array.from({ length: INVOICE_LIST_CONCURRENCY }, async () => {
        for (let filter = queue.shift(); filter; filter = queue.shift()) {
          const params = filter;
          try {
            for await (const invoices of fetchPages((page) =>
              stripe.invoices.list({ ...params, ...page })
            )) {
              payments.push(...invoices.map(toProviderPayment));
              log.info(
                `  • Fetched ${payments.length} invoices, ${done} of ${filters.length} lists done`
              );
            }
          } catch (e) {
            // A missing customer has no invoices to compare
            if (!isResourceMissingError(e)) {
              throw e;
            }
          }
          done++;
        }
      })
    );

    return payments;
  }

  async fetchPaymentsByIds(
    ids: string[]
  ): Promise<Map<string, ProviderPayment | null>> {
    log.info(`📡 Fetching ${ids.length} Stripe invoices...`);
    const payments = new Map<string, ProviderPayment | null>();
    for (const id of ids) {
      try {
        const invoice = await retryRateLimited(() =>
          stripe.invoices.retrieve(id)
        );
        payments.set(id, toProviderPayment(invoice));
      } catch (e) {
        if (!isResourceMissingError(e)) {
          throw e;
        }
        payments.set(id, null);
      }
    }
    return payments;
  }
}
