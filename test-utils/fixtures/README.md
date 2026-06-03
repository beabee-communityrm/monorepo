# Test Data Documentation

The test database is seeded in two passes (see `.github/actions/test-setup/action.yml`):

1. **`test-db-default.sql`** — static data (contacts, payments, callouts, …)
2. **`test-db-custom.sql`** — environment-specific data (options, emails, content); placeholder values `__stripeWebhookSecret__` and `__stripeProductId__` are substituted at import time

Both files are consumed by `apps/browser-tests` (Playwright) and `apps/e2e-api-tests` (Vitest API tests).

---

## Contacts

| Name         | Email                         | Password (plaintext) | Role                    | Purpose                                                |
| ------------ | ----------------------------- | -------------------- | ----------------------- | ------------------------------------------------------ |
| Admin Beabee | `hello@worldofadmin.com`      | _(no password set)_  | `superadmin`            | Spare admin — no tests depend on this account directly |
| Test Test    | `api_test@beabee.io`          | `playWRIGHT09`       | `member` + `superadmin` | API test user; admin login in browser tests            |
| Rate Limit   | `api_ratelimittest@beabee.io` | `playWRIGHT09`       | `member` (active)       | Rate-limit test user; member login in browser tests    |

### Requirements — Contacts

- `api_test@beabee.io` must keep password `playWRIGHT09`
- `api_ratelimittest@beabee.io` must keep password `playWRIGHT09`.
- `api_test@beabee.io` must have the `superadmin` role.
- `api_ratelimittest@beabee.io` must have an active `member` role.
- `api_ratelimittest@beabee.io` must have an active subscription in `contact_contribution`.

---

## API Keys

Two API keys are seeded - one for test user and one for rate-limited test user.

### Requirements — API Keys

- API keys must exist for `api_test@beabee.io` and `api_ratelimittest@beabee.io` and the keys must be in sync with `api-test-info.json`. That is, if you regenerate a key you must update both the SQL hash and `api-test-info.json`.

---

## Payments

Ten payments are seeded across various contacts and subscription types (one-time and recurring).

### Requirements — Payments

- **At least 10 payments must be present.**
  `payment.test.ts` paginates with `limit: 5, offset: 0` and `limit: 5, offset: 5` and asserts both pages return exactly 5 items.

---

## Callouts

Two callouts are seeded

| Slug                 | Access           | Title (variant)     | Used by                    |
| -------------------- | ---------------- | ------------------- | -------------------------- |
| `test-cnr`           | `guest`          | "Another CNR"       | _not used currently_       |
| `test-cnr-anonymous` | `only-anonymous` | "Anonymous callout" | `callout-response.spec.ts` |

### Requirements — Callouts

- **Callout with slug `test-cnr-anonymous` must exist and have `only-anonymous` access.**

- **The `test-cnr-anonymous` callout variant title must be "Anonymous callout".**

- **`test-cnr-anonymous` must be currently open (no `expires` in the past).**

- **`test-cnr-anonymous` form must include fields `name` (min length 5, required), `email`, and a `testFramework` selectboxes field with options `playwright` and `vitest`.**

---

## Email Templates

| Template ID         | Subject                            |
| ------------------- | ---------------------------------- |
| `setup-account`     | "Do you want to setup an account?" |
| `one-time-donation` | "Bestätigung der Einmalspende"     |

### Requirements — Email Templates

- **The `setup-account` template must have subject "Do you want to setup an account?" and body HTML that contains a link with the text "Setup account".**

- **The `one-time-donation` template must exist.**

---

## Options / Feature Flags

| Key                                | Value                                             |
| ---------------------------------- | ------------------------------------------------- |
| `show-one-time-donation`           | `"true"`                                          |
| `switch-feature-one-time-donation` | `"true"`                                          |
| `stripe-membership-product-id`     | `__stripeProductId__` injected from CI secret     |
| `stripe-webhook-secret`            | `__stripeWebhookSecret__` injected from CI secret |
| `support-email`                    | `"support@beabee.io"`                             |

### Requirements — Options

- **`show-one-time-donation` and `switch-feature-one-time-donation` must both be `"true"`.**

---

## Join Content

The `join` content record configures contribution periods and amounts.

```json
{
  "periods": [
    { "name": "monthly", "presetAmounts": [3, 5, 10] },
    { "name": "annually", "presetAmounts": [36, 60, 120] },
    { "name": "one-time", "presetAmounts": [3, 5, 10] }
  ],
  "paymentMethods": ["s_card", "s_sepa", "s_bacs", "s_paypal"]
}
```

### Requirements — Join Content

- **The `one-time` period must be present and include `3` and `5` in `presetAmounts`.**

- **`s_card` must be listed in `paymentMethods`.**
  Both browser tests click the card payment button on the join form.

---

## Cross-Suite Consistency Checklist

When modifying test data, verify the following are kept in sync:

| What to check                            | Files to update                                                |
| ---------------------------------------- | -------------------------------------------------------------- |
| `api_test@beabee.io` password            | `test-db-default.sql` + `api-test-info.json` + `testData.json` |
| `api_ratelimittest@beabee.io` password   | `test-db-default.sql` + `api-test-info.json` + `testData.json` |
| `e987c4eddb30e70e` API key secret        | `test-db-default.sql` + `api-test-info.json`                   |
| `9bff5e02b1ab24eb` API key secret        | `test-db-default.sql` + `api-test-info.json`                   |
| `test-cnr-anonymous` callout form fields | `test-db-default.sql`                                          |
| `setup-account` email subject/body       | `test-db-custom.sql`                                           |
| One-time presetAmounts                   | `test-db-custom.sql`                                           |
| Total payment count                      | `test-db-default.sql`                                          |
