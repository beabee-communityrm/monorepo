import Stripe from "stripe";
import { config } from "@beabee/config";
import { LocaleObject } from "@beabee/locales";
import type { StripeTaxRateCreateParams } from "#types/stripe-tax-rate-create-params";

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: "2024-04-10",
  typescript: true
});

/**
 * Disable a tax rate.
 *
 * @param id The id of the tax rate
 * @param options The options for the request
 * @returns The response from Stripe
 */
export const stripeTaxRateDisable = async (
  id: string,
  options?: Stripe.RequestOptions
): Promise<Stripe.Response<Stripe.TaxRate>> => {
  console.debug("Disabling tax rate", id);
  return stripe.taxRates.update(id, { active: false }, options);
};

/**
 * Create a default tax rate.
 *
 * @param data The data to create the tax rate with
 * @param locale The locale to use for the display name, should be the current locale.
 * @param options The options for the request
 * @returns The response from Stripe
 */
export const stripeTaxRateCreateDefault = async (
  data: StripeTaxRateCreateParams,
  locale: LocaleObject,
  options?: Stripe.RequestOptions
): Promise<Stripe.Response<Stripe.TaxRate>> => {
  data.active = data.active !== false;
  data.metadata ||= {};

  return stripe.taxRates.create(
    {
      inclusive: true,
      ...data,
      metadata: {
        "created-by": "beabee",
        ...data.metadata
      },
      display_name: data.display_name || locale.taxRate.invoiceName
    },
    options
  );
};

/**
 * Update or create a tax rate.
 *
 * @param data The data to create the tax rate with
 * @param id The id of the tax rate to update or disable
 * @param options The options for the request
 * @returns
 */
export const stripeTaxRateUpdateOrCreateDefault = async (
  data: StripeTaxRateCreateParams,
  locale: LocaleObject,
  id?: string,
  options?: Stripe.RequestOptions
): Promise<Stripe.Response<Stripe.TaxRate>> => {
  // If the id and percentage is set, we need to check if the percentage is the same
  if (id) {
    // If the percentage is not set, we can just update the tax rate
    if (data.percentage === undefined) {
      return stripe.taxRates.update(id, data, options);
    }

    let oldTaxRate = await stripe.taxRates.retrieve(id);

    // If the percentage is set, but the same, we can also just update the tax rate
    if (oldTaxRate.percentage === data.percentage) {
      const updateData: Stripe.TaxRateUpdateParams &
        Partial<StripeTaxRateCreateParams> = {
        ...data
      };
      delete updateData.percentage;
      return stripe.taxRates.update(id, updateData, options);
    }
    // If the percentage is different, we need to disable the old tax rate and create a new one
    else {
      await stripeTaxRateDisable(id, options);
    }
  }

  return stripeTaxRateCreateDefault(data, locale, options);
};

export { Stripe };