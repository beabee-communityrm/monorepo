# Changelog

## [0.44.2](https://github.com/beabee-communityrm/monorepo/compare/v0.44.1...v0.44.2) (2026-05-11)

### What's Changed
* feat (payment): Add Google Pay and Apple Pay icons to payment options by @aasthas9 in https://github.com/beabee-communityrm/monorepo/pull/587


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.44.1...v0.44.2

## [0.44.1](https://github.com/beabee-communityrm/monorepo/compare/v0.44.0...v0.44.1) (2026-05-08)

### What's Changed
* hotfix(legacy): fix clean-deep CJS import breaking form POSTs by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/592


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.44.0...v0.44.1

## [0.44.0](https://github.com/beabee-communityrm/monorepo/compare/v0.43.0...v0.44.0) (2026-05-08)

### Highlights

This release marks a major milestone for the Beabee monorepo: the **complete migration to ESM**. CommonJS is fully gone — every published package and every backend app now runs as native ECMAScript Modules, building with plain `tsc` instead of the previous custom `@beabee/esbuild` pipeline. The result is a leaner, simpler, more standards-aligned codebase with fewer moving parts and easier maintenance going forward.

Alongside the ESM migration, this release brings a broad **dependency refresh** across the monorepo: TypeScript 6, Vitest 4, vue-tsc 3, FontAwesome 7, Yarn 4.14, Node 24, Postgres 16, and a long list of safe minor and major bumps — all upgraded together to keep the project on a healthy, current foundation.

A handful of payment, form, and email fixes round out the release.

#### ESM Migration
* feat(esm): PR4 – build with tsc only, drop @beabee/esbuild, bump TypeScript 6 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/547
* feat(esm): PR3 – published packages ESM-only + cleanup by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/546
* feat(esm): PR2 – flip packages/core and all backend apps to ESM by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/545
* build: ESM migration foundation — TypeORM index generator and migration plan by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/544

#### Dependency Updates
* chore: upgrade yarn 4.12.0 → 4.14.1 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/554
* chore(deps): safe minor/patch updates across the monorepo by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/553
* chore(docker): refresh base images (postgres 16, node 24, nginx 1.30, maildev 2.2.1) by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/555
* chore(deps): low-risk major bumps (uuid 14, dotenv 17, ajv-formats 3, @inquirer/prompts align) by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/556
* chore(deps): bump @types/express-session 1.18 → 1.19 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/557
* chore(deps): bump @captchafox/node 1.2.0 → 1.4.0 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/558
* chore(deps): vue-tsc 2 → 3 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/577
* chore(deps): @fortawesome/* 6 → 7 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/575
* chore(deps): small CLI tooling majors (yargs 18, dpdm 4, query-string 9) by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/574
* chore(deps): vitest 3 → 4 by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/576

#### Features & Fixes
* feat(email): make required email merge fields mandatory by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/532
* fix(payment): reset cancellation status on new recurring contribution by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/551
* fix(frontend): make map reverse-geocoding optional by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/589
* fix(frontend): form should always have a valid period by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/591

#### Docs
* docs(agents): flag 'as <T>' casts as warning sign by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/588

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.43.0...v0.44.0

## [0.43.0](https://github.com/beabee-communityrm/monorepo/compare/v0.43.0-beta.1...v0.43.0) (2026-05-06)

### What's Changed
* feat(backend-cli): three-level anonymisation for database export by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/537
* fix(backend-cli): fix primary key constraint issue between payment an… by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/540
* fix (frontend-variables): fix default values for frontend env variables by @aasthas9 in https://github.com/beabee-communityrm/monorepo/pull/543
* Add new test workflow by @aasthas9 in https://github.com/beabee-communityrm/monorepo/pull/549
* feat(frontend/form.io): Create custom provider that works with MapTiler by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/323

### New Contributors
* @aasthas9 made their first contribution in https://github.com/beabee-communityrm/monorepo/pull/543

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.42.0...v0.43.0

## [0.43.0-beta.1](https://github.com/beabee-communityrm/monorepo/compare/v0.42.0...v0.43.0-beta.1) (2026-04-29) (Pre-release)

### What's Changed

* feat(frontend/form.io): Create custom provider that works with MapTiler by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/323
* feat(backend-cli): add verify-address-migration command by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/539
* feat(backend-cli): three-level anonymisation for database export by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/537

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.42.0...v0.43.0-beta.1

## [0.42.0](https://github.com/beabee-communityrm/monorepo/compare/v0.42.0-beta.3...v0.42.0) (2026-04-29)

### What's Changed
* refactor(api-errors): introduce type-safe and shared errors across frontend and backend by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/530
* fix(backend-cli): update anonymiser to more realistic payment data ra… by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/533
* fix(docs): remove deprecated docs. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/535
* feat(backend-cli): port callout response CSV import by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/534
* fix(contact-form): Hide payment source field when no options by @libby-correctiv in https://github.com/beabee-communityrm/monorepo/pull/538
* fix(mc-groups): add valid group list independent of join flow by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/536

### New Contributors
* @libby-correctiv made their first contribution in https://github.com/beabee-communityrm/monorepo/pull/538

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.41.3...v0.42.0

## [0.42.0-beta.3](https://github.com/beabee-communityrm/monorepo/compare/v0.42.0-beta.2...v0.42.0-beta.3) (2026-04-23) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.42.0-beta.2...v0.42.0-beta.3

## [0.42.0-beta.2](https://github.com/beabee-communityrm/monorepo/compare/v0.42.0-beta.1...v0.42.0-beta.2) (2026-04-23) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.42.0-beta.1...v0.42.0-beta.2

## [0.42.0-beta.1](https://github.com/beabee-communityrm/monorepo/compare/v0.41.3...v0.42.0-beta.1) (2026-04-23) (Pre-release)

### What's Changed
* refactor(api-errors): introduce type-safe and shared errors across frontend and backend by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/530
* fix(backend-cli): update anonymiser to more realistic payment data ra… by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/533
* fix(docs): remove deprecated docs. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/535
* feat(backend-cli): port callout response CSV import by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/534


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.41.3...v0.42.0-beta.1

## [0.41.3](https://github.com/beabee-communityrm/monorepo/compare/v0.41.2...v0.41.3) (2026-04-21)

### What's Changed
* fix(api): add rate limiter to callout responses. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/531


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.41.2...v0.41.3

## [0.41.2](https://github.com/beabee-communityrm/monorepo/compare/v0.41.1...v0.41.2) (2026-04-20)

### What's Changed
* chore(auth): improve logging for authentication actions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/529


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.41.1...v0.41.2

## [0.41.1](https://github.com/beabee-communityrm/monorepo/compare/v0.41.0...v0.41.1) (2026-04-16)

### What's Changed
* fix(error-code): catch more API errors appropriately by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/525
* fix(store): only load general content on first page load by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/527
* build(locale): clear tsbuildinfo file properly (updated name) by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/526


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.41.0...v0.41.1

## [0.41.0](https://github.com/beabee-communityrm/monorepo/compare/v0.40.3...v0.41.0) (2026-04-01)

#### New Features

- **Ongoing email management in the new UI** — The ongoing email management has been moved from the legacy dashboard to the modern frontend. Includes a new navigation link to email template management under settings, UI consistency improvements, and label fixes (gender-neutral German terms, consistent English capitalization). (#498 by @RayMille)

- **`export-callouts` CLI command** — New command to export callout data (responses, variants, tags) without including contacts, making it safe to import into test environments. Supports `--callout-slug` filtering, `--file` output, `--merge` imports, and answer preservation. (#520 by @JumpLink)

#### Improvements

- **Setup without payment methods** — beabee can now be set up without any payment methods enabled. GoCardless is disabled by default as it is not used by new instances. (#521 by @wpf500)

#### Bug Fixes

- **Payment form error handling** — Fixed `cant-update-contribution` errors not being displayed correctly, caused by using `AppForm` instead of `AppApiForm` and a missing error message entry. (#522 by @wpf500, test coverage in #523 by @JumpLink)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.40.3...v0.41.0

## [0.40.3](https://github.com/beabee-communityrm/monorepo/compare/v0.40.3-rc.1...v0.40.3) (2026-03-31)

### What's Changed
* feat(payment-flow): handle payment flows in payment service and providers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/496


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.40.2...v0.40.3

## [0.40.3-rc.1](https://github.com/beabee-communityrm/monorepo/compare/v0.40.2...v0.40.3-rc.1) (2026-03-30) (Pre-release)

### What's Changed
* feat(payment-flow): handle payment flows in payment service and providers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/496


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.40.2...v0.40.3-rc.1

## [0.40.2](https://github.com/beabee-communityrm/monorepo/compare/v0.40.1...v0.40.2) (2026-03-30)

### What's Changed
* fix(migration): signup flow date should be migrated from payment flow date by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/518
* chore(membership): extend grace periods for memberships to 14 days by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/519


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.40.1...v0.40.2

## [0.40.1](https://github.com/beabee-communityrm/monorepo/compare/v0.40.0...v0.40.1) (2026-03-25)

### What's Changed
* refactor(signup-flow): move signup logic to SignupService and improve PaymentFlowService action handling by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/490
* refactor(payment-flow): cleaner naming and service method order by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/495


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.40.0...v0.40.1

## [0.40.0](https://github.com/beabee-communityrm/monorepo/compare/v0.39.3...v0.40.0) (2026-03-25)

### What's Changed
* refactor(payment-flow): rename Join* entities to Payment* by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/489
* chore: consolidate agent prompts into AGENTS.md by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/517


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.39.3...v0.40.0

## [0.39.3](https://github.com/beabee-communityrm/monorepo/compare/v0.39.2...v0.39.3) (2026-03-18)

### What's Changed

#### New Features

* **Spanish localization for the CrowdNewsroom** — Added Spanish (es) as a new supported language, including locale configuration, date formatting, and initial AI-generated translations for all application components. ([#516](https://github.com/beabee-communityrm/monorepo/pull/516)) by @JumpLink

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.39.2...v0.39.3

## [0.39.2](https://github.com/beabee-communityrm/monorepo/compare/v0.39.1...v0.39.2) (2026-03-13)

### What's Changed
* fix: anonymisation scripts export by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/514
* fix(logging): log.warn should be log.warning by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/515


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.39.1...v0.39.2

## [0.39.1](https://github.com/beabee-communityrm/monorepo/compare/v0.39.0...v0.39.1) (2026-03-13)

### What's Changed
* feat(backend-cli): automate some Stripe setup by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/483
* chore: allow running backend-cli from monorepo root by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/512


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.39.0...v0.39.1

## [0.39.0](https://github.com/beabee-communityrm/monorepo/compare/v0.39.0-rc.3...v0.39.0) (2026-03-11)

### What's Changed
* feat(join-flow): add payment failed status page by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/421
* feat: add endpoint for invoice PDFs by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/424
* refactor(locale): align with Weblate and simplify locale tooling by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/429
* feat(client): use error extractor across API error handlers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/430
* feat(one-time-donations): one-time donation endpoints for logged-in users by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/391
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/422
* feat: enable one-time contribution form by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/423
* chore(weblate): add Weblate CLI configuration for translation management by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/431
* feat: add payment type field by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/425
* chore(locale): update after build sorted keys by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/436
* chore: Rebuild index.ts exports using `yarn generate:index` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/440
* feat(vue): add AppLoadingSpinner and use in AppImageUpload and contact detail by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/439
* feat(vue): add prefixAction and suffixAction slots to AppInput by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/438
* v0.37.1 Release by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/432
* fix(fontawesome): test imported incorrectly. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/442
* fix(payments): allow one-time payments via join flow for active members by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/437
* feat(frontend): add payment aggregations to admin contact overview by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/420
* feat(api): add filters for one-time contributions to payments table by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/416
* feat(api): add filters for one-time contributions to the contacts table by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/410
* fix(frontend): autogenerated typed router is not updated. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/444
* fix: minisearch + Histoire upgrade, AppIconPicker story, remove unused AppBadge by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/443
* feat: improve Stripe syncing tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/435
* feat: add separate one-time and recurring tax rates by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/441
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/445
* feat(otc): confirm one-time contributions before confirm email by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/447
* chore(locale): Enable Prettier for `@beabee/locale` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/446
* fix(payment-flow): store created contact when keeping flow to shortcut finalization by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/449
* fix(locale): add missing label and all its translations by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/450
* feat(contacts): One-off email to segment by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/434
* fix(payment-flow): allow multiple join flows per contact by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/452
* chore(dependencies): remove axios from frontend by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/457
* fix(payment-flow): better handle failed invoices by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/454
* feat(email-editor): align editor and preview height on desktop by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/456
* feat(otc-form): move contribution form to contribution page by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/455
* fix(locale): EN locale file not being sorted by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/460
* feat(payment-flow): separate email for one-time contributors without accounts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/459
* chore: update email template descriptions and names by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/461
* fix: other small one-time contribution problems by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/458
* fix(payment-flow): take one-time payment before sending confirm email by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/463
* fix(locale): add payment failed message by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/465
* feat(AppAsyncButton): Forward button properties to by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/464
* fix(app-api-form): forward #buttons slot to AppForm by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/467
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/453
* feat(contacts): template support and tracking for one-off segment emails by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/462
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/468
* feat(env): add setting for turning logging off and on. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/448
* fix(frontend): allow linking to one-time contributions. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/469
* fix(config): make BEABEE_LOGGING optional by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/470
* chore(deps): Switch to Node.js 24 LTS by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/473
* refactor(frontend): Use # subpath imports by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/475
* chore(deps): Upgrade Yarn to version 4.12.0  by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/476
* feat(backend-cli): Update anonymisation scripts and move to backend-cli by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/466
* refactor(backend): Migrate to # subpath imports, remove module-alias by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/474
* feat(contacts): email template overview and management by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/471
* feat(otc): use a global switch to enable/disable OTC by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/472
* chore(backend-cli): admin shouldn't default to member by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/481
* fix(rte): trim links in the editor by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/486
* feat(backend-cli): add command to clean old database data by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/484
* fix(AppModal): fix touch scroll in mfa by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/488
* feat(payment): add payment CSV export functionality by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/485
* fix(payment-flow): add flag to prevent duplicate payment flow processing by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/494
* fix(contact-page): only aggregate successful payments by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/499
* fix(payment-flow): add flag to prevent duplicate payment flow processing (2) by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/500
* chore(stripe-sync-cli): add more options to Stripe sync tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/502
* chore(stripe-sync-cli): improve syncing tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/503
* fix(stripe-sync-cli): load all Stripe-related contributions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/504
* fix(stripe-webhook): ignore duplicate id error on invoice.created by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/505
* tmp(email): hide new email UI by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/507
* build(test): always run tests on main and allow manual trigger by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/510
* Merge v0.38.0-rc.1..v0.38.0-rc.14 changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/509
* feat(ui): handle segment loading error gracefully by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/478


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.37.1...v0.39.0

## [0.39.0-rc.3](https://github.com/beabee-communityrm/monorepo/compare/v0.39.0-rc.2...v0.39.0-rc.3) (2026-03-10) (Pre-release)

### What's Changed
* feat(ui): handle segment loading error gracefully by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/478


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.39.0-rc.2...v0.39.0-rc.3

## [0.39.0-rc.2](https://github.com/beabee-communityrm/monorepo/compare/v0.39.0-rc.1...v0.39.0-rc.2) (2026-03-10) (Pre-release)

### What's Changed
* feat(otc): use a global switch to enable/disable OTC by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/472
* fix(AppModal): fix touch scroll in mfa by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/488
* feat(payment): add payment CSV export functionality by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/485
* fix(payment-flow): add flag to prevent duplicate payment flow processing by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/494
* fix(contact-page): only aggregate successful payments by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/499
* chore(stripe-sync-cli): add more options to Stripe sync tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/502
* chore(stripe-sync-cli): improve syncing tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/503
* fix(stripe-sync-cli): load all Stripe-related contributions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/504
* fix(stripe-webhook): ignore duplicate id error on invoice.created by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/505
* build(test): always run tests on main and allow manual trigger by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/510
* Merge v0.38.0-rc.1..v0.38.0-rc.14 changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/509


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.39.0-rc.1...v0.39.0-rc.2

## [0.39.0-rc.1](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.15...v0.39.0-rc.1) (2026-03-10) (Pre-release)

### What's Changed
* feat(join-flow): add payment failed status page by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/421
* feat: add endpoint for invoice PDFs by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/424
* refactor(locale): align with Weblate and simplify locale tooling by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/429
* feat(client): use error extractor across API error handlers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/430
* feat(one-time-donations): one-time donation endpoints for logged-in users by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/391
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/422
* feat: enable one-time contribution form by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/423
* chore(weblate): add Weblate CLI configuration for translation management by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/431
* feat: add payment type field by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/425
* chore(locale): update after build sorted keys by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/436
* chore: Rebuild index.ts exports using `yarn generate:index` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/440
* feat(vue): add AppLoadingSpinner and use in AppImageUpload and contact detail by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/439
* feat(vue): add prefixAction and suffixAction slots to AppInput by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/438
* v0.37.1 Release by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/432
* fix(fontawesome): test imported incorrectly. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/442
* fix(payments): allow one-time payments via join flow for active members by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/437
* feat(frontend): add payment aggregations to admin contact overview by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/420
* feat(api): add filters for one-time contributions to payments table by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/416
* feat(api): add filters for one-time contributions to the contacts table by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/410
* fix(frontend): autogenerated typed router is not updated. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/444
* fix: minisearch + Histoire upgrade, AppIconPicker story, remove unused AppBadge by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/443
* feat: improve Stripe syncing tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/435
* feat: add separate one-time and recurring tax rates by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/441
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/445
* feat(otc): confirm one-time contributions before confirm email by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/447
* chore(locale): Enable Prettier for `@beabee/locale` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/446
* fix(payment-flow): store created contact when keeping flow to shortcut finalization by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/449
* fix(locale): add missing label and all its translations by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/450
* feat(contacts): One-off email to segment by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/434
* fix(payment-flow): allow multiple join flows per contact by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/452
* chore(dependencies): remove axios from frontend by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/457
* fix(payment-flow): better handle failed invoices by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/454
* feat(email-editor): align editor and preview height on desktop by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/456
* feat(otc-form): move contribution form to contribution page by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/455
* fix(locale): EN locale file not being sorted by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/460
* feat(payment-flow): separate email for one-time contributors without accounts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/459
* chore: update email template descriptions and names by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/461
* fix: other small one-time contribution problems by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/458
* fix(payment-flow): take one-time payment before sending confirm email by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/463
* fix(locale): add payment failed message by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/465
* feat(AppAsyncButton): Forward button properties to by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/464
* fix(app-api-form): forward #buttons slot to AppForm by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/467
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/453
* feat(contacts): template support and tracking for one-off segment emails by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/462
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/468
* feat(env): add setting for turning logging off and on. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/448
* fix(frontend): allow linking to one-time contributions. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/469
* fix(config): make BEABEE_LOGGING optional by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/470
* chore(deps): Switch to Node.js 24 LTS by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/473
* refactor(frontend): Use # subpath imports by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/475
* chore(deps): Upgrade Yarn to version 4.12.0  by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/476
* feat(backend-cli): Update anonymisation scripts and move to backend-cli by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/466
* refactor(backend): Migrate to # subpath imports, remove module-alias by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/474
* feat(contacts): email template overview and management by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/471
* chore(backend-cli): admin shouldn't default to member by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/481
* fix(rte): trim links in the editor by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/486
* feat(backend-cli): add command to clean old database data by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/484
* fix(payment-flow): add flag to prevent duplicate payment flow processing (2) by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/500
* tmp(email): hide new email UI by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/507


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.37.1...v0.39.0-rc.1

## [0.38.0-rc.15](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.14...v0.38.0-rc.15) (2026-03-09) (Pre-release)

### What's Changed
* tmp(stripe-webhook): disable detach payment method for failed one-time payments by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/506


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.14...v0.38.0-rc.15

## [0.38.0-rc.14](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.13...v0.38.0-rc.14) (2026-03-09) (Pre-release)

### What's Changed
* fix(stripe-webhook): ignore duplicate id error on invoice.created by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/505


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.13...v0.38.0-rc.14

## [0.38.0-rc.13](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.12...v0.38.0-rc.13) (2026-03-09) (Pre-release)

### What's Changed
* fix(stripe-sync-cli): load all Stripe-related contributions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/504


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.12...v0.38.0-rc.13

## [0.38.0-rc.12](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.11...v0.38.0-rc.12) (2026-03-09) (Pre-release)

### What's Changed
* chore(stripe-sync-cli): improve syncing tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/503


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.11...v0.38.0-rc.12

## [0.38.0-rc.11](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.10...v0.38.0-rc.11) (2026-03-09) (Pre-release)

### What's Changed
* chore(stripe-sync-cli): add more options to Stripe sync tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/502


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.10...v0.38.0-rc.11

## [0.38.0-rc.10](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.9...v0.38.0-rc.10) (2026-03-09) (Pre-release)

### What's Changed
* fix(contact-page): only aggregate successful payments by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/499


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.9...v0.38.0-rc.10

## [0.38.0-rc.9](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.8...v0.38.0-rc.9) (2026-03-04) (Pre-release)

### What's Changed
* feat(payment): add payment CSV export functionality by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/485
* fix(payment-flow): add flag to prevent duplicate payment flow processing by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/494


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.8...v0.38.0-rc.9

## [0.38.0-rc.8](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.7...v0.38.0-rc.8) (2026-02-25) (Pre-release)

### What's Changed
* fix(AppModal): fix touch scroll in mfa by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/488


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.7...v0.38.0-rc.8

## [0.38.0-rc.7](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.6...v0.38.0-rc.7) (2026-02-23) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.6...v0.38.0-rc.7

## [0.38.0-rc.6](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.5...v0.38.0-rc.6) (2026-02-23) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.5...v0.38.0-rc.6

## [0.38.0-rc.5](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.4...v0.38.0-rc.5) (2026-02-19) (Pre-release)

### What's Changed
* feat(otc): use a global switch to enable/disable OTC by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/472


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.4...v0.38.0-rc.5

## [0.38.0-rc.4](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.3...v0.38.0-rc.4) (2026-02-13) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.3...v0.38.0-rc.4

## [0.38.0-rc.3](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.2...v0.38.0-rc.3) (2026-02-12) (Pre-release)

### What's Changed
* fix(config): make BEABEE_LOGGING optional by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/470


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.2...v0.38.0-rc.3

## [0.38.0-rc.2](https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.1...v0.38.0-rc.2) (2026-02-12) (Pre-release)

### What's Changed
* feat(env): add setting for turning logging off and on. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/448
* fix(frontend): allow linking to one-time contributions. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/469


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.38.0-rc.1...v0.38.0-rc.2

## [0.38.0-rc.1](https://github.com/beabee-communityrm/monorepo/compare/v0.37.1...v0.38.0-rc.1) (2026-02-12) (Pre-release)

### What's Changed
* feat(join-flow): add payment failed status page by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/421
* feat: add endpoint for invoice PDFs by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/424
* refactor(locale): align with Weblate and simplify locale tooling by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/429
* feat(client): use error extractor across API error handlers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/430
* feat(one-time-donations): one-time donation endpoints for logged-in users by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/391
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/422
* feat: enable one-time contribution form by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/423
* chore(weblate): add Weblate CLI configuration for translation management by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/431
* feat: add payment type field by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/425
* chore(locale): update after build sorted keys by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/436
* chore: Rebuild index.ts exports using `yarn generate:index` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/440
* feat(vue): add AppLoadingSpinner and use in AppImageUpload and contact detail by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/439
* feat(vue): add prefixAction and suffixAction slots to AppInput by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/438
* v0.37.1 Release by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/432
* fix(fontawesome): test imported incorrectly. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/442
* fix(payments): allow one-time payments via join flow for active members by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/437
* feat(frontend): add payment aggregations to admin contact overview by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/420
* feat(api): add filters for one-time contributions to payments table by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/416
* feat(api): add filters for one-time contributions to the contacts table by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/410
* fix(frontend): autogenerated typed router is not updated. by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/444
* fix: minisearch + Histoire upgrade, AppIconPicker story, remove unused AppBadge by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/443
* feat: improve Stripe syncing tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/435
* feat: add separate one-time and recurring tax rates by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/441
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/445
* feat(otc): confirm one-time contributions before confirm email by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/447
* chore(locale): Enable Prettier for `@beabee/locale` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/446
* fix(payment-flow): store created contact when keeping flow to shortcut finalization by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/449
* fix(locale): add missing label and all its translations by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/450
* feat(contacts): One-off email to segment by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/434
* fix(payment-flow): allow multiple join flows per contact by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/452
* chore(dependencies): remove axios from frontend by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/457
* fix(payment-flow): better handle failed invoices by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/454
* feat(email-editor): align editor and preview height on desktop by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/456
* feat(otc-form): move contribution form to contribution page by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/455
* fix(locale): EN locale file not being sorted by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/460
* feat(payment-flow): separate email for one-time contributors without accounts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/459
* chore: update email template descriptions and names by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/461
* fix: other small one-time contribution problems by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/458
* fix(payment-flow): take one-time payment before sending confirm email by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/463
* fix(locale): add payment failed message by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/465
* feat(AppAsyncButton): Forward button properties to by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/464
* fix(app-api-form): forward #buttons slot to AppForm by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/467
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/453
* feat(contacts): template support and tracking for one-off segment emails by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/462


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.37.0...v0.38.0-rc.1

## [0.37.1](https://github.com/beabee-communityrm/monorepo/compare/v0.37.0...v0.37.1) (2026-01-29)

### What's Changed
* fix(legacy/emails): One-off email creation in legacy frontend by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/433
* feat(atlas): Allow adding CNR answer in the URL params and adding Italian translations by @RayMille https://github.com/beabee-communityrm/monorepo/pull/432

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.37.0...v0.37.1

## [0.37.0](https://github.com/beabee-communityrm/monorepo/compare/v0.36.8...v0.37.0) (2026-01-29)

### What's Changed
* feat(email): Add system email management to settings by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/388
* chore: remove old generated route by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/427
* chore: update generated typed-router by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/428
* fix(app-form): use AppApiForm wrapper to always handle API errors nicely by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/426


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.8...v0.37.0

## [0.36.8](https://github.com/beabee-communityrm/monorepo/compare/v0.36.8-alpha.2...v0.36.8) (2026-01-20)

This release enables more regular syncing between beabee and the newsletter service :mailbox_with_mail: 

### What's Changed
* chore(sync-nl-cli): enable cronjobs for NL syncing commands by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/418
* fix(mc-api): make batch response processing work reliably by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/419


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.7...v0.36.8

## [0.36.8-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.36.8-alpha.1...v0.36.8-alpha.2) (2026-01-20) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.8-alpha.1...v0.36.8-alpha.2

## [0.36.8-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.36.7...v0.36.8-alpha.1) (2026-01-19) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.7...v0.36.8-alpha.1

## [0.36.7](https://github.com/beabee-communityrm/monorepo/compare/v0.36.7-alpha.2...v0.36.7) (2026-01-19)

### What's Changed
* fix(mc-webhook): ignore unknown webhook types by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/415
* feat(sync-nl-cli): add tool to clear the pending status for contacts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/406
* fix: small NL CLI syncing bugs by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/417


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.6...v0.36.7

## [0.36.7-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.36.7-alpha.1...v0.36.7-alpha.2) (2026-01-19) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.7-alpha.1...v0.36.7-alpha.2

## [0.36.7-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.36.6...v0.36.7-alpha.1) (2026-01-19) (Pre-release)

### What's Changed
* fix(mc-webhook): ignore unknown webhook types by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/415
* feat(sync-nl-cli): add tool to clear the pending status for contacts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/406


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.6...v0.36.7-alpha.1

## [0.36.6](https://github.com/beabee-communityrm/monorepo/compare/v0.36.5...v0.36.6) (2026-01-16)

### What's Changed
* fix(sync-nl-cli): use correct MC params by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/414


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.5...v0.36.6

## [0.36.5](https://github.com/beabee-communityrm/monorepo/compare/v0.36.4...v0.36.5) (2026-01-15)

### What's Changed
* chore: re-enable old cronjob temporarily by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/413


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.4...v0.36.5

## [0.36.4](https://github.com/beabee-communityrm/monorepo/compare/v0.36.4-alpha.1...v0.36.4) (2026-01-15)

### What's Changed
* feat: add separate form for one time donations in home membership section by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/386
* perf(mailchimp): try to not use batch API if possible by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/411
* feat(sync-nl-cli): add more regular NL syncing by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/412


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.3...v0.36.4

## [0.36.4-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.36.3...v0.36.4-alpha.1) (2026-01-15) (Pre-release)

Testing https://github.com/beabee-communityrm/monorepo/pull/411 as an alpha release

### What's Changed
* feat: add separate form for one time donations in home membership section by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/386


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.3...v0.36.4-alpha.1

## [0.36.3](https://github.com/beabee-communityrm/monorepo/compare/v0.36.2...v0.36.3) (2026-01-15)

### What's Changed
* fix(segments): make process-segment script more reliable by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/408


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.1...v0.36.3

## [0.36.2](https://github.com/beabee-communityrm/monorepo/compare/v0.36.1...v0.36.2) (2026-01-13)

### What's Changed
* chore(sync-nl-cli): add --importNew to toggle importing new contacts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/409

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.1...v0.36.2

## [0.36.1](https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.5...v0.36.1) (2026-01-12)

### What's Changed
* feat(backend-cli): support fixed time window newsletter reconcillation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/404
* fix(sync-nl-cli): fix undefined profile for old contacts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/407
* feat(sync-nl-cli): better NL reconciliation control and reporting by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/405


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.0...v0.36.1

## [0.36.1-alpha.5](https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.4...v0.36.1-alpha.5) (2026-01-12) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.4...v0.36.1-alpha.5

## [0.36.1-alpha.4](https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.3...v0.36.1-alpha.4) (2026-01-12) (Pre-release)

### What's Changed
* feat(backend-cli): support fixed time window newsletter reconcillation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/404


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.3...v0.36.1-alpha.4

## [0.36.1-alpha.3](https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.2...v0.36.1-alpha.3) (2026-01-12) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.2...v0.36.1-alpha.3

## [0.36.1-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.1...v0.36.1-alpha.2) (2026-01-12) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.1-alpha.1...v0.36.1-alpha.2

## [0.36.1-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.36.0...v0.36.1-alpha.1) (2026-01-12) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.36.0...v0.36.1-alpha.1

## [0.36.0](https://github.com/beabee-communityrm/monorepo/compare/v0.36.0-alpha.1...v0.36.0) (2026-01-08)

### What's Changed
* Backend: Email Template Management Migration by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/387
* chore: remove console.log noise from logging by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/400
* chore(callout-responses): log existing contact callout response path by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/401
* feat: faster Mailchimp webhook response by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/402
* refactor(backend-cli): Create newsletter service sync subcommands by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/403


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.35.1...v0.36.0

## [0.36.0-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.35.1...v0.36.0-alpha.1) (2026-01-07) (Pre-release)

### What's Changed
* Backend: Email Template Management Migration by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/387
* chore: remove console.log noise from logging by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/400
* chore(callout-responses): log existing contact callout response path by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/401
* feat: faster Mailchimp webhook response by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/402


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.35.1...v0.36.0-alpha.1

## [0.35.1](https://github.com/beabee-communityrm/monorepo/compare/v0.35.0...v0.35.1) (2025-12-05)

### What's Changed
* fix: support callout response filters in contact segments on legacy app by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/398


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.35.0...v0.35.1

## [0.35.0](https://github.com/beabee-communityrm/monorepo/compare/v0.34.0...v0.35.0) (2025-12-05)

### What's Changed
* Add email preview functionality and refactor email handling by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/355
* feat: Implement backend for callout response email notifications by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/351
* Add Email Tab to Callout Builder Sidebar by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/349
* fix(config): remove unhelpful defaults from MinIO env vars by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/374
* feat(one-time-donations): add separate email for one-time donations on join flow by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/370
* test(frontend): added frontend testing and an initial test by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/383
* Merge changes from v0.34.x by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/385
* feat: one-time donation join flow copy changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/372
* Adds merge fields dropdown to rich text editors in email template editors. by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/364
* Prepair v0.35.0: Supplementing and correcting translations by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/389
* chore: update locales by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/392
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/382
* fix(locale): add back translation that got lost on merge by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/393
* fix(locale): add missing German translations by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/395
* chore: merge latest from Weblate by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/396
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/394
* fix:  by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/397


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.34.0...v0.35.0

## [0.34.0](https://github.com/beabee-communityrm/monorepo/compare/v0.33.13...v0.34.0) (2025-11-27)

This release lays the groundwork for the upcoming one-time donations feature.

### What's Changed
* build: upgrade TS and fix some TSConfig inconsistencies by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/371
* feat: one-time donations by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/363
* Merge changes from v0.33.x by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/377
* Merge changes from V0.33.x into main by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/380
* chore(locales): update locales by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/381


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.13...v0.34.0

## [0.33.13](https://github.com/beabee-communityrm/monorepo/compare/v0.33.12...v0.33.13) (2025-11-26)

### What's Changed
* feat(backend-cli): Add --without-password filter to cleanup users from bug by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/379


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.12...v0.33.13

## [0.33.12](https://github.com/beabee-communityrm/monorepo/compare/v0.33.12-rc.1...v0.33.12) (2025-11-26)

### What's Changed
* fix: CNR_MODE detection by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/376


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.11...v0.33.12

## [0.33.12-rc.1](https://github.com/beabee-communityrm/monorepo/compare/v0.33.11...v0.33.12-rc.1) (2025-11-25) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.11...v0.33.12-rc.1

## [0.33.11](https://github.com/beabee-communityrm/monorepo/compare/v0.33.10...v0.33.11) (2025-11-11)

### What's Changed
* fix: update npm packages by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/366


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.10...v0.33.11

## [0.33.10](https://github.com/beabee-communityrm/monorepo/compare/v0.33.9...v0.33.10) (2025-10-30)

### What's Changed
* fix(vue): ensure AppRichTextEditor placeholder drives minimum height by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/343
* fix(login): update password tries directly to avoid Mailchimp updates by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/345
* feat(signup): add rate limiting to signup endpoints with tests by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/337
* fix(cnrMode): Force OnlyAnonymous access for all callouts in CNR mode by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/350
* fix(frontend/upload): Prevent Form Submission During File Uploads by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/348
* chore(callouts): remove experimental features flag for NL sync by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/359
* fix(frontend): Can't filter CNR answers by bucket by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/332


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.9...v0.33.10

## [0.33.9](https://github.com/beabee-communityrm/monorepo/compare/v0.33.8...v0.33.9) (2025-10-07)

### What's Changed
* fix(locale): set nl admin ui to english by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/346


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.8...v0.33.9

## [0.33.8](https://github.com/beabee-communityrm/monorepo/compare/v0.33.7...v0.33.8) (2025-10-01)

### What's Changed
* fix(embed): make notification container non-fixed in an embed by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/336


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.7...v0.33.8

## [0.33.7](https://github.com/beabee-communityrm/monorepo/compare/v0.33.6...v0.33.7) (2025-09-29)

### What's Changed
* fix(backend): increase limit to allow gif uploads by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/344


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.6...v0.33.7

## [0.33.6](https://github.com/beabee-communityrm/monorepo/compare/v0.33.5...v0.33.6) (2025-09-25)

### What's Changed
* refactor(tests): merge tests and organize file structure by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/329
* fix(backend): put higher delays on chron jobs by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/341


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.5...v0.33.6

## [0.33.5](https://github.com/beabee-communityrm/monorepo/compare/v0.33.4...v0.33.5) (2025-09-22)

### What's Changed
* feat(legacy-emails): show which merge tags are actually available by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/335


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.4...v0.33.5

## [0.33.4](https://github.com/beabee-communityrm/monorepo/compare/v0.33.3...v0.33.4) (2025-09-22)

### What's Changed
* fix(embed): embeds should always be a column by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/334


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.3...v0.33.4

## [0.33.3](https://github.com/beabee-communityrm/monorepo/compare/v0.33.2...v0.33.3) (2025-09-16)

### What's Changed
* fix(status-page): add i18n plugin for translations by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/330
* chore(callout-controller): increase body size limit from 100kb to 300kb by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/331


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.2...v0.33.3

## [0.33.2](https://github.com/beabee-communityrm/monorepo/compare/v0.33.1...v0.33.2) (2025-09-10)

### What's Changed
* chore(stripe-payment-form): report Stripe error code to user to help with debugging by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/327


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.1...v0.33.2

## [0.33.1](https://github.com/beabee-communityrm/monorepo/compare/v0.33...v0.33.1) (2025-09-04)

### What's Changed
* feat(callouts): Make response footer links translatable by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/309
* feat(crowdnewsroom): Add segments for crowdnewsroom results by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/318


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.33.0...v0.33.1

## [0.33](https://github.com/beabee-communityrm/monorepo/compare/v0.32.3...v0.33) (2025-09-01)

### What's Changed
* fix(core): Trigger Double Opt-In process mailchimp by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/320
* refactor(routing): Migrate from vite-plugin-pages to unplugin-vue-router by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/297


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.32.3...v0.33

## [0.32.3](https://github.com/beabee-communityrm/monorepo/compare/v0.32.2...v0.32.3) (2025-08-21)

### What's Changed
* docs(env): add MapTiler setup for BEABEE_MAPTILER_KEY with screenshots by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/308
* docs(env): add concise Stripe setup guide with screenshots by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/307
* fix(vue): stabilize AppLinkList v-model to preserve input and support multiple links by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/310
* Revert "fix(vue): stabilize AppLinkList v-model to preserve input and support multiple links" by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/313
* fix(vue): stabilize AppLinkList v-model to preserve input and support multiple links (Reapply) by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/315
* fix(core): Improve image service error handling for non-existent files by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/301
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/316
* fix(newsletters): split non-sync NL updating from usual NL status updates by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/319


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.32.2...v0.32.3

## [0.32.2](https://github.com/beabee-communityrm/monorepo/compare/v0.32.1...v0.32.2) (2025-08-12)

### What's Changed
* fix(frontend): add default icons to map by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/312


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.32.1...v0.32.2

## [0.32.1](https://github.com/beabee-communityrm/monorepo/compare/v0.32.0...v0.32.1) (2025-08-12)

### What's Changed
* feat: icons for mapping responses on atlas by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/274
* fix(frontend): fix assign reviewer button not working by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/311


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.32.0...v0.32.1

## [0.32.0](https://github.com/beabee-communityrm/monorepo/compare/v0.31.3...v0.32.0) (2025-08-07)

The major change in this release is that we've renamed “Callout” to “CrowdNewsroom”. All previous public URLs will be redirected, end users won't notice any difference. Get in touch to find out more.

### What's Changed
* feat: redirect links from callout > crowdnewsroom by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/280
* feat: rename callouts to CrowdNewsrooms by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/269
* fix: restore missing translation key for untitled callouts by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/290
* fix(docker): Fresh frontend service startup errors using default env vars by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/294
* feat(cursor): Add Developer Approval Requirement for AI Commits by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/299
* feat(crowdnewsroom): Rename routes from "callouts" to "crowdnewsrooms"* by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/298
* fix(router): redirection to legacy app by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/300
* chore: resolve conflicts and merge weblate changes  by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/302
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/303
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/304
* fix: missing informal translation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/305
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/306


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.31.3...v0.32.0

## [0.31.3](https://github.com/beabee-communityrm/monorepo/compare/v0.31.2...v0.31.3) (2025-08-06)

### What's Changed
* fix(frontend): make tags selectable by default by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/295
* fix(locale): add missing labels by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/296


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.31.2...v0.31.3

## [0.31.2](https://github.com/beabee-communityrm/monorepo/compare/v0.31.1...v0.31.2) (2025-08-01)

### What's Changed
* fix: really fix link truncating by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/293


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.31.1...v0.31.2

## [0.31.1](https://github.com/beabee-communityrm/monorepo/compare/v0.31.0...v0.31.1) (2025-08-01)

### What's Changed
* fix: URL link display on Atlas by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/292


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.31.0...v0.31.1

## [0.31.0](https://github.com/beabee-communityrm/monorepo/compare/v0.30.0...v0.31.0) (2025-08-01)

### What's Changed
* feat: add callout reviewer editor permission by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/273
* feat: add search by email callout reviewer by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/281
* Merge feat/731-reviewer-editor into main by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/289
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/291
* feat: fetch all data for map using pagination by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/279
* fix: handle Mailchimp archived status and add fallback for new statuses by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/284


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.30.0...v0.31.0

## [0.30.0](https://github.com/beabee-communityrm/monorepo/compare/v0.29.2...v0.30.0) (2025-07-31)

### What's Changed
* test: add Prettier to e2e tests by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/255
* test: start all services for tests by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/256
* docs: Update README onboarding by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/263
* fix: Critical loop logic bug in CalloutResponse file upload detection by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/260
* Vue Package Modernization: Component Migration & i18n Integration by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/267
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/270
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/271
* fix: generate locale JSON files deterministically by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/275
* chore: updated README with information translation levels by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/272
* Merge v0.29.x changes into main by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/277
* Translations update from Hosted Weblate by @weblate in https://github.com/beabee-communityrm/monorepo/pull/278
* fix: pre-release testing issues by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/286
* feat: truncate url in map response side bar by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/282
* feat: fix conditional logic in response display by @RayMille in https://github.com/beabee-communityrm/monorepo/pull/283
* fix: PaymentMethod component imports by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/287

### New Contributors
* @RayMille made their first contribution in https://github.com/beabee-communityrm/monorepo/pull/263

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.29.2...v0.30.0

## [0.29.2](https://github.com/beabee-communityrm/monorepo/compare/v0.29.1...v0.29.2) (2025-07-17)

### What's Changed

* fix: translate min/max length errors in Form.IO by @wpf500 in #276

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.29.1...v0.29.2

## [0.29.1](https://github.com/beabee-communityrm/monorepo/compare/v0.29.0...v0.29.1) (2025-06-24)

This patch release includes two small but important fixes:

* **Favicon path resolution** has been corrected, ensuring the icon loads as expected in all environments (#251).
* **Callout variant enforcement**: While writing tests, we noticed that `createMinimalTestCallout` lacked a default variant. This fix adds stricter type enforcement to avoid potential runtime issues (#249).

Thanks to @wpf500 and @JumpLink for the quick improvements!

**Full Changelog**: [https://github.com/beabee-communityrm/monorepo/compare/v0.29.0...v0.29.1](https://github.com/beabee-communityrm/monorepo/compare/v0.29.0...v0.29.1)

## [0.29.0](https://github.com/beabee-communityrm/monorepo/compare/v0.28.1...v0.29.0) (2025-06-19)

This release introduces a wide range of improvements to developer tooling, infrastructure, and internationalization support. We’ve added new packages, refactored core logic, improved translation workflows, and resolved several long-standing issues.

---

### 🌍 Internationalization via Weblate

* Full integration of **Weblate** for collaborative translations
* Multiple translation updates from Hosted Weblate
* **Fallback language support** for more resilient multilingual UX

PRs: #198, #199, #200, #204, #213

---

### 🧰 Developer Experience & Tooling

* New `@beabee/dev-cli` package with helpful CLI utilities
* New `@beabee/template-vanilla` for simple package scaffolding
* Modular `.cursorrules` and Vue component templates for Cursor IDE
* Unified `tsconfig` references and prettier config with sorted imports

PRs: #221, #223, #224, #229, #230, #232, #234, #237

---

### ⚙️ Infrastructure & CI Improvements

* ✅ Health check endpoint with frontend wait logic
* 🖥️ `AppStatusPage` component for monitoring system state
* 🐳 Docker build reliability improved, including dev-cli fixes
* 🔐 Environment variable management centralized
* 🧪 Docker Compose test setup no longer hangs

PRs: #218, #219, #220, #227, #228, #231

---

### 🐞 Bug Fixes & UX Improvements

* 🖼️ File validation now correctly supports image uploads
* 🖼️ Gallery response panel fix on image click
* 🧾 Notice field added below payment button
* 🛫 Improved initialization of user and content state
* ⚙️ Vite config updated for Beabee integration
* 🧵 Watch jobs no longer artificially limited

PRs: #215, #216, #226, #240, #241, #243, #248

---

### 🧹 Refactoring & Maintenance

* Package and workspace cleanup
* Removed deprecated file upload migration service

PRs: #217, #222

---

### 📊 Full Changelog

See [all changes](https://github.com/beabee-communityrm/monorepo/compare/v0.28.0...v0.29.0) from `v0.28.0` to `v0.29.0`.

## [0.28.1](https://github.com/beabee-communityrm/monorepo/compare/v0.28.0...v0.28.1) (2025-05-27)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.28.0...v0.28.1

## [0.28.0](https://github.com/beabee-communityrm/monorepo/compare/v0.27.4...v0.28.0) (2025-05-20)

### What's Changed
* feat: Implement rate limiting for file uploads by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/186
* feat: Image upload controller + service by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/175
* feat: Add MinIO service and configuration for file storage by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/163

## Breaking Change: Upload Storage Migration to MinIO

We've replaced the PictShare image upload service with MinIO, a more robust and scalable S3-compatible storage solution for file uploads. This change provides a solid foundation for all image and document handling needs while maintaining security and performance.

### What's New
- Implemented fully integrated image service using MinIO
- Created dedicated document service for PDF uploads and retrieval
- Added support for automatic image resizing with multiple dimensions
- Enhanced image format support: jpeg, png, webp, gif, avif and svg
- AVIF as default format for optimal size/quality balance
- Added path attribute for files in addition to url (url is now deprecated)

### Benefits
- Images are scaled on first access, not during upload
- No migration scripts needed for new scaled images
- Only used images and documents are migrated
- Simplified setup with reduced complexity
- Easy adaptation for other data formats
- Better control over image quality and formats

### Migration Guide

This update requires configuration changes and a data migration. Please follow these steps carefully:

#### 1. Update your docker-compose.yml file

You need to make these changes to your configuration:
- Remove the `img_upload_app` service section
- Add the new `minio` service section as shown below
- Add the `minio_data` volume to the volumes section

```yaml
## MinIO service
minio:
  image: beabee/beabee-minio:release
  restart: always
  ports:
    - "${BEABEE_MINIO_PORT_ADMIN:-9000}:9000"  # Admin port for debugging, not for production
    - "${BEABEE_MINIO_PORT_CONSOLE:-9001}:9001"  # Console port (Admin UI), not for production
  volumes:
    - minio_data:/data
  environment:
    # Map our BEABEE_ prefixed vars to what MinIO expects
    MINIO_ROOT_USER: ${BEABEE_MINIO_ROOT_USER:-minioadmin}
    MINIO_ROOT_PASSWORD: ${BEABEE_MINIO_ROOT_PASSWORD:-minioadmin}
    MINIO_REGION: ${BEABEE_MINIO_REGION:-us-east-1}
    # Pass BEABEE_ variables for our own use
    BEABEE_MINIO_BUCKET: ${BEABEE_MINIO_BUCKET:-uploads}
    BEABEE_MINIO_ENDPOINT: ${BEABEE_MINIO_ENDPOINT:-http://minio:9000}
```

Don't forget to add this to your volumes section:
```yaml
volumes:
  # ... existing volumes ...
  minio_data:
```

#### 2. Update your .env file

Add these environment variables:
```
BEABEE_MINIO_ROOT_USER=minioadmin  # Choose a secure username
BEABEE_MINIO_ROOT_PASSWORD=minioadmin  # Choose a secure password
BEABEE_MINIO_BUCKET=uploads
BEABEE_MINIO_ENDPOINT=http://minio:9000
```

#### 3. Migrate your existing uploads

1. **Important:** Check the actual name of your old uploads volume. The volume name may vary between installations and might not be exactly `upload_data`. You can check your current volume names with `docker volume ls`.

2. Mount the old uploads volume to your API service:
```yaml
## In the api_app service section:
volumes:
  - your_old_upload_volume_name:/old_data
```

3. Start your services:
```
docker compose up -d
```

4. Run the migration command:
```
docker compose exec api_app yarn backend-cli migrate-uploads --source=/old_data
```

5. After verifying that all uploads are successfully migrated, you can remove the temporary volume mount from your API service.

For reference, you can find an up-to-date docker-compose.yml file in the [beabee-deploy repository](https://github.com/beabee-communityrm/beabee-deploy) to use as a template for your configuration.

### New API Endpoints

- `POST /api/1.0/images` - Upload an image
- `POST /api/1.0/documents` - Upload a document (PDF)
- `GET /api/1.0/images/[image-id]` - Retrieve an image
- `GET /api/1.0/images/[image-id]?w=800` - Retrieve a resized image
- `GET /api/1.0/documents/[document-id]` - Retrieve a document

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.4...v0.28.0

## [0.27.4](https://github.com/beabee-communityrm/monorepo/compare/v0.27.3...v0.27.4) (2025-05-06)

### What's Changed
* chore: throw non 500 error for API requests with unmappable contact by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/197


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.3...v0.27.4

## [0.27.3](https://github.com/beabee-communityrm/monorepo/compare/v0.27.2...v0.27.3) (2025-05-05)

### What's Changed
* feat: optionally base64 encode config values by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/196


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.2...v0.27.3

## [0.27.2](https://github.com/beabee-communityrm/monorepo/compare/v0.27.1...v0.27.2) (2025-05-05)

### What's Changed
* fix: only send enabled ongoing emails by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/194
* chore: bump map page limit pending pagination support by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/195


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.1...v0.27.2

## [0.27.1](https://github.com/beabee-communityrm/monorepo/compare/v0.27.0...v0.27.1) (2025-05-05)

### What's Changed
* fix: require guest fields for NL opt-in by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/192
* fix: NL opt-in still visible if callout becomes only anonymous by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/193


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.0...v0.27.1

## [0.27.0](https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-rc.3...v0.27.0) (2025-05-05)

### New features
- Now you can automatically add new users to your contacts list via callouts
- You can also ask for newsletter opt-ins, and even subscribe people automatically to a newsletter list (if you have a Mailchimp integration)

#### What’s not changing?
- You can still set your callouts to be restricted to members, or to be totally anonymous
- The guest information fields are the same - it only collects name and email address
- If an existing contact/member answers a callout, their answers will be synced with their existing profile

### What's Changed
* feat: create contact from guest submission by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/159
* test: database credentials are hardcoded for tests by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/179
* chore: convert error to warning by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/182
* feat: show guest NL opt in by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/160
* feat: suppress some response errors for guest submissions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/178
* Merge v0.26.x changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/185
* chore: CRM feature behind flag by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/188
* fix(locale): Leichtes Sprache -> Leichte Sprache by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/189
* chore: update locale strings for callout/CRM feature by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/190
* fix: hide member captcha question on CNR mode by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/191


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.6...v0.27.0

## [0.27.0-rc.3](https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-rc.2...v0.27.0-rc.3) (2025-05-05) (Pre-release)

### What's Changed
* fix: hide member captcha question on CNR mode by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/191


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-rc.2...v0.27.0-rc.3

## [0.27.0-rc.2](https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-rc.1...v0.27.0-rc.2) (2025-05-05) (Pre-release)

### What's Changed
* chore: update locale strings for callout/CRM feature by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/190


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-rc.1...v0.27.0-rc.2

## [0.27.0-rc.1](https://github.com/beabee-communityrm/monorepo/compare/v0.26.6...v0.27.0-rc.1) (2025-05-05) (Pre-release)

### What's Changed
* feat: create contact from guest submission by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/159
* test: database credentials are hardcoded for tests by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/179
* chore: convert error to warning by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/182
* feat: show guest NL opt in by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/160
* feat: suppress some response errors for guest submissions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/178
* Merge v0.26.x changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/185
* chore: CRM feature behind flag by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/188
* fix(locale): Leichtes Sprache -> Leichte Sprache by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/189


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.6...v0.27.0-rc.1

## [0.26.6](https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-alpha.2...v0.26.6) (2025-05-02)

### What's Changed
* fix(locale): Leichtes Sprache -> Leichte Sprache by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/187


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.5...v0.26.6

## [0.27.0-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.26.5...v0.27.0-alpha.2) (2025-04-30) (Pre-release)

### What's Changed
* fix: Captcha settings by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/183
* Merge v0.26.x changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/185


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-alpha.1...v0.27.0-alpha.2

## [0.26.5](https://github.com/beabee-communityrm/monorepo/compare/v0.27.0-alpha.1...v0.26.5) (2025-04-30)

### What's Changed
* fix: Captcha settings by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/183


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.4...v0.26.5

## [0.27.0-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.26.4...v0.27.0-alpha.1) (2025-04-29) (Pre-release)

### What's Changed
* feat: create contact from guest submission by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/159
* test: database credentials are hardcoded for tests by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/179
* feat: show guest NL opt in by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/160
* feat: suppress some response errors for guest submissions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/178


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.4...v0.27.0-alpha.1

## [0.26.4](https://github.com/beabee-communityrm/monorepo/compare/v0.26.3...v0.26.4) (2025-04-29)

### What's Changed
* chore: convert error to warning by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/182

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.3...v0.26.4

## [0.26.3](https://github.com/beabee-communityrm/monorepo/compare/v0.26.2...v0.26.3) (2025-04-17)

### What's Changed
* fix(vue/theme): Fix theme plugin and contribution payment button by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/176

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.2...v0.26.3

## [0.26.2](https://github.com/beabee-communityrm/monorepo/compare/v0.26.1...v0.26.2) (2025-04-15)

### What's Changed
* fix: reviewer displayName is undefined by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/173
* feat: add button to manage reviewers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/174


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.1...v0.26.2

## [0.26.1](https://github.com/beabee-communityrm/monorepo/compare/v0.26.0...v0.26.1) (2025-04-15)

### What's Changed
* Fix tag icon floating by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/171


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.26.0...v0.26.1

## [0.26.0](https://github.com/beabee-communityrm/monorepo/compare/v0.25.5...v0.26.0) (2025-04-15)

What’s changing?
- The user interface for creating callouts has a new design
- Better experience for managing settings, start/end messages, buttons, form layout
- Better experience for setting translations
- New filter for active users in the contacts list

What’s not changing?
- The actual functionality of callouts - everything still works the same


### What's Changed
* feat(histoire): Add Histoire and move core button UI components to new @beabee/vue package by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/153
* fix: only load contact tags for admins by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/161
* refactor: new components in @beabee/vue by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/162
* fix: cron build occassionally failing on apt-get step by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/167
* feat: callout admin UX changes (rebased) by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/164
* fix: CNR detection by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/168
* chore: update i18n by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/169
* feat: add active user filter by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/170


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.25.5...v0.26.0

## [0.25.5](https://github.com/beabee-communityrm/monorepo/compare/v0.25.4...v0.25.5) (2025-03-03)

### What's Changed
* fix: payment method update URL by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/158


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.25.4...v0.25.5

## [0.25.4](https://github.com/beabee-communityrm/monorepo/compare/v0.25.3...v0.25.4) (2025-03-03)

### What's Changed
* fix: no contribution signup error by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/157


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.25.3...v0.25.4

## [0.25.3](https://github.com/beabee-communityrm/monorepo/compare/v0.25.2...v0.25.3) (2025-02-27)

### What's Changed
* fix: locale placeholder compilation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/156


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.25.2...v0.25.3

## [0.25.2](https://github.com/beabee-communityrm/monorepo/compare/v0.25.1...v0.25.2) (2025-02-27)

### What's Changed
* fix(i18n): update locale import path to ESM format by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/151
* refactor(e2e-test): Moved env.ts to test utils + more cleanups + fixes by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/150
* chore: generate locale from branch name by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/154
* fix: language switching by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/155


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.25.1...v0.25.2

## [0.25.1](https://github.com/beabee-communityrm/monorepo/compare/v0.25.0...v0.25.1) (2025-02-25)

### What's Changed
* feat: add NL translations by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/147


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.25.0...v0.25.1

## [0.25.0](https://github.com/beabee-communityrm/monorepo/compare/v0.25.0-rc.1...v0.25.0) (2025-02-25)

### What's Changed
* Add Code Assistant Settings by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/134
* refactor: clearer data update order for Mailchimp by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/136
* feat: add active user tag to Mailchimp by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/137
* doc(providers): Restructuring of payment providers and add payment documentation by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/140
* Remove unnecessary add tag, now handled inside NewsletterService by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/139
* feat(backend-cli): Enhance CLI with new commands and local execution support by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/135
* feat(frontend): Replace the old client with the new one by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/143
* Add client tests by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/128
* feat: add email for failed initial contributions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/138
* Merge v0.24.x changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/142
* feat: add query parameter for map center and zoom level by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/149


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.24.3...v0.25.0

## [0.25.0-rc.1](https://github.com/beabee-communityrm/monorepo/compare/v0.24.3...v0.25.0-rc.1) (2025-02-24) (Pre-release)

### What's Changed
* Add Code Assistant Settings by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/134
* refactor: clearer data update order for Mailchimp by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/136
* feat: add active user tag to Mailchimp by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/137
* doc(providers): Restructuring of payment providers and add payment documentation by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/140
* Remove unnecessary add tag, now handled inside NewsletterService by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/139
* feat(backend-cli): Enhance CLI with new commands and local execution support by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/135
* feat(frontend): Replace the old client with the new one by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/143
* Add client tests by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/128
* feat: add email for failed initial contributions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/138
* Merge v0.24.x changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/142


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.24.3...v0.25.0

## [0.24.3](https://github.com/beabee-communityrm/monorepo/compare/v0.24.2...v0.24.3) (2025-02-05)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.24.2...v0.24.3

## [0.24.2](https://github.com/beabee-communityrm/monorepo/compare/v0.24.1...v0.24.2) (2025-02-05)

### What's Changed
* feat: add query param to suppress add button by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/141


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.24.1...v0.24.2

## [0.24.1](https://github.com/beabee-communityrm/monorepo/compare/v0.24.0...v0.24.1) (2025-02-03)

Would be helpful to actually merge the Mailchimp changes :sweat_smile: 

### What's Changed
* feat: further Mailchimp integration improvements by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/124


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.24.0...v0.24.1

## [0.24.0](https://github.com/beabee-communityrm/monorepo/compare/v0.23.6-alpha.3...v0.24.0) (2025-02-03)

A bumper release of changes that got a bit queued up.

**Mailchimp integration**
We've fixed a few bugs and generally improved our Mailchimp integration. Most notably, users in a compliance state (e.g. unsubscribed) will now be sent an opt-in email instead of just failing. This fixes a long standing issue where an unsubscribed user was irrecoverable until they opted back in via Mailchimp

**iDEAL payments**
We've added support for iDEAL payments, although it's currently still in beta. Get in touch if you want to help test it.

**Callout Atlas**
Callout Atlases have improved response clustering, users can now see responses even if they are clustered together.

**Other changes**

* Small improvements to embed script
* Package dependency upgrades
* Removed Deno, this was causing a lot of build problems
* Added some testing infrastructure and a few tests :tada:
* Various developer experience improvements for increased productivity

### What's Changed
* feat: E2E API Test by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/100
* Remove Deno by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/99
* feat(client): Port frontend api methods to client by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/92
* feat(client): client copied from telegram-bot repo by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/91
* build: update dependencies by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/114
* build: fix TypeScript version by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/113
* fix: try to handle Mailchimp compliance state by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/106
* fix: prettier formatting in VSCode by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/120
* Prevent terminal output from being cleared on `yarn dev` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/116
* chore: Move client API tests to `packages/client/test` by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/117
* build: mount only the volumes each service needs by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/123
* Switch from Jest to Vitest by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/125
* GitHub Action for Automated Testing upon approval by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/126
* chore: ensure embed takes up as much space as possible by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/129
* Test: Authentication and encapsulation of beabee client tests by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/118
* feat: initial implementation of showing clustered responses by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/119
* Merge changes from v0.23.x branch by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/122
* build: use built in tsc and node watch support by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/133
* feat: add support for iDEAL payments by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/132


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.5...v0.24.0

## [0.23.6-alpha.3](https://github.com/beabee-communityrm/monorepo/compare/v0.23.6-alpha.2...v0.23.6-alpha.3) (2025-01-23) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.6-alpha.2...v0.23.6-alpha.3

## [0.23.6-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.23.6-alpha.1...v0.23.6-alpha.2) (2025-01-23) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.6-alpha.1...v0.23.6-alpha.2

## [0.23.6-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.23.5...v0.23.6-alpha.1) (2025-01-23) (Pre-release)

Try disabling `waitForLoad`

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.5...v0.23.6-alpha.1

## [0.23.5](https://github.com/beabee-communityrm/monorepo/compare/v0.23.4...v0.23.5) (2025-01-22)

### What's Changed
* chore: embed block fixes for 0.23.x by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/130


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.4...v0.23.5

## [0.23.4](https://github.com/beabee-communityrm/monorepo/compare/v0.23.3...v0.23.4) (2025-01-08)

### What's Changed
* fix: remove old tags from contact profile updates by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/121


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.3...v0.23.4

## [0.23.3](https://github.com/beabee-communityrm/monorepo/compare/v0.23.2...v0.23.3) (2024-12-17)

### What's Changed
* fix: add missing i18n strings by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/112
* chore: add Libre Franklin font option by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/111


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.2...v0.23.3

## [0.23.2](https://github.com/beabee-communityrm/monorepo/compare/v0.23.1...v0.23.2) (2024-12-17)

### What's Changed
* chore: add phone number input by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/109
* fix: randomise cron times to reduce server overload by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/110


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.1...v0.23.2

## [0.23.1](https://github.com/beabee-communityrm/monorepo/compare/v0.23.0...v0.23.1) (2024-12-13)

### What's Changed
* fix: not all callout tags being returned by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/108


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.0...v0.23.1

## [0.23.0](https://github.com/beabee-communityrm/monorepo/compare/v0.23.0-alpha.2...v0.23.0) (2024-12-11)

### What's Changed
* feat: add Apple Pay configuration by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/101
* fix: check for valid VAT number by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/107


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.1...v0.23.0

## [0.23.0-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.23.0-alpha.1...v0.23.0-alpha.2) (2024-12-11) (Pre-release)

### What's Changed
* fix: check for valid VAT number by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/107


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.23.0-alpha.1...v0.23.0-alpha.2

## [0.23.0-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.22.1...v0.23.0-alpha.1) (2024-12-11) (Pre-release)

### What's Changed
* feat: add Apple Pay configuration by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/101


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.1...v0.23.0-alpha.1

## [0.22.1](https://github.com/beabee-communityrm/monorepo/compare/v0.22.0...v0.22.1) (2024-12-11)

### What's Changed
* fix: handle no password set more gracefully by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/105


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.0...v0.22.1

## [0.22.0](https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.5...v0.22.0) (2024-12-05)

### What's Changed
* refactor: share backend config by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/82
* refactor: move webhooks to separate app by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/83
* fix: update contact validation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/90
* refactor: split legacy app from backend by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/84
* feat: add UI for callout reviewers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/93
* feat: add callout reviewer by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/89
* Cleanup package.json files and more by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/94
* fix: permanently delete contacts not clearing everything by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/95
* fix: delete reviewer on callout or contact deletion by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/97
* build: stop prerelease builds getting tagged as release by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/96
* feat: show callout admin button for reviewers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/98
* chore: update i18n by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/102
* chore: callout response entity permission changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/104


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.21.2...v0.22.0

## [0.22.0-alpha.5](https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.4...v0.22.0-alpha.5) (2024-12-05) (Pre-release)

### What's Changed
* chore: callout response entity permission changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/104


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.4...v0.22.0-alpha.5

## [0.22.0-alpha.4](https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.3...v0.22.0-alpha.4) (2024-12-04) (Pre-release)

### What's Changed
* chore: update i18n by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/102


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.3...v0.22.0-alpha.4

## [0.22.0-alpha.3](https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.2...v0.22.0-alpha.3) (2024-11-28) (Pre-release)

### What's Changed
* feat: show callout admin button for reviewers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/98


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.2...v0.22.0-alpha.3

## [0.22.0-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.1...v0.22.0-alpha.2) (2024-11-26) (Pre-release)

### What's Changed
* fix: delete reviewer on callout or contact deletion by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/97
* build: stop prerelease builds getting tagged as release by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/96


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.22.0-alpha.1...v0.22.0-alpha.2

## [0.22.0-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.21.4...v0.22.0-alpha.1) (2024-11-26) (Pre-release)

### What's Changed
* refactor: share backend config by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/82
* refactor: move webhooks to separate app by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/83
* fix: update contact validation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/90
* refactor: split legacy app from backend by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/84
* feat: add UI for callout reviewers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/93
* feat: add callout reviewer by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/89
* Cleanup package.json files and more by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/94
* fix: permanently delete contacts not clearing everything by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/95


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.21.4...v0.22.0-alpha.1

## [0.21.4](https://github.com/beabee-communityrm/monorepo/compare/v0.21.3...v0.21.4) (2024-11-26)

### What's Changed
* fix: permanently delete contacts not clearing everything by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/95


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.21.3...v0.21.4

## [0.21.3](https://github.com/beabee-communityrm/monorepo/compare/v0.21.2...v0.21.3) (2024-11-21)

### What's Changed
* fix: update contact validation by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/90


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.21.2...v0.21.3

## [0.21.2](https://github.com/beabee-communityrm/monorepo/compare/v0.21.1...v0.21.2) (2024-11-19)

### What's Changed
* fix: remove references to profile.tags by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/88


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.21.1...v0.21.2

## [0.21.1](https://github.com/beabee-communityrm/monorepo/compare/v0.21.0...v0.21.1) (2024-11-19)

### What's Changed
* chore: add checked option for NL groups by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/85
* hotfix(contact-tagging): Delete tag rules with with unused tags by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/86


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.21.0...v0.21.1

## [0.21.0](https://github.com/beabee-communityrm/monorepo/compare/v0.20.8...v0.21.0) (2024-11-19)

### What's Changed
* Feat(contact-tagging): Add support tagable contacts with bulk action by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/63, https://github.com/beabee-communityrm/monorepo/pull/79, https://github.com/beabee-communityrm/monorepo/pull/80


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.8...v0.21.0

## [0.20.8](https://github.com/beabee-communityrm/monorepo/compare/v0.20.7...v0.20.8) (2024-11-14)

### What's Changed
* fix: scroll form to top on next slide by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/78


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.7...v0.20.8

## [0.20.7](https://github.com/beabee-communityrm/monorepo/compare/v0.20.6...v0.20.7) (2024-11-14)

### What's Changed
* fix: only add whitespace pre-wrap to text areas by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/77


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.6...v0.20.7

## [0.20.6](https://github.com/beabee-communityrm/monorepo/compare/v0.20.5...v0.20.6) (2024-11-14)

### What's Changed
* feat: import response tool by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/76


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.5...v0.20.6

## [0.20.5](https://github.com/beabee-communityrm/monorepo/compare/v0.20.4...v0.20.5) (2024-11-12)

### What's Changed
* fix: callout response anonymisers by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/66


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.4...v0.20.5

## [0.20.4](https://github.com/beabee-communityrm/monorepo/compare/v0.20.3...v0.20.4) (2024-11-11)

### What's Changed
* feat: link guest emails to a contact if possible by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/61
* fix: cron job service by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/75


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.3...v0.20.4

## [0.20.3](https://github.com/beabee-communityrm/monorepo/compare/v0.20.2...v0.20.3) (2024-11-07)

### What's Changed
* fix: frontend version info by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/74


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.2...v0.20.3

## [0.20.2](https://github.com/beabee-communityrm/monorepo/compare/v0.20.1...v0.20.2) (2024-11-06)

### What's Changed
* fix: missing version string in release by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/72


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.1...v0.20.2

## [0.20.1](https://github.com/beabee-communityrm/monorepo/compare/v0.20.0...v0.20.1) (2024-11-06)

### What's Changed
* fix: use matrix to push multiple tags by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/71


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.20.0...v0.20.1

## [0.20.0](https://github.com/beabee-communityrm/monorepo/compare/v0.19.3...v0.20.0) (2024-11-05)

### What's Changed
* chore(router): Add router to monorepo by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/57
* chore: remove deprecated isPartial flag by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/60
* chore: show input mask in advanced options by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/67
* Merge all deploy/release actions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/65
* Fix various Docker stack problems by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/64
* feat: upgrade Dockerfiles and runtimes by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/54


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.19.2...v0.20.0

## [0.19.3](https://github.com/beabee-communityrm/monorepo/compare/v0.19.2...v0.19.3) (2024-11-05)

### What's Changed
* chore: show input mask in advanced options by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/67

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.19.2...v0.19.3

## [0.19.2](https://github.com/beabee-communityrm/monorepo/compare/v0.19.1...v0.19.2) (2024-10-22)

### What's Changed
* fix: expanded property not updating by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/62


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.19.1...v0.19.2

## [0.19.1](https://github.com/beabee-communityrm/monorepo/compare/v0.19.0...v0.19.1) (2024-10-21)

### What's Changed
* feat: support simple prefilled answer query parameter by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/59


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.19.0...v0.19.1

## [0.19.0](https://github.com/beabee-communityrm/monorepo/compare/v0.18.8...v0.19.0) (2024-10-21)

We're back after a break. Mostly developer experience improvements here but we're laying the foundations for more to come :).

We've also cleaned up and made the UI for callouts more similar between maps, galleries and the standard form.

### What's Changed
* refactor: remove duplicate callout types by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/50
* feat: add share button to more parts of a callout by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/51
* refactor: remove duplicate types from frontend by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/52
* chore(easier-setup): Easier start for new developers by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/53
* chore(github): Set deno to v1.x for Github Actions by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/55
* chore(github): Fix action: Location of .env has changed by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/56

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.8...v0.19.0

## [0.18.8](https://github.com/beabee-communityrm/monorepo/compare/v0.18.7...v0.18.8) (2024-08-29)

### What's Changed
* chore: add privacy links by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/49


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.7...v0.18.8

## [0.18.7](https://github.com/beabee-communityrm/monorepo/compare/v0.18.6...v0.18.7) (2024-08-29)

### What's Changed
* chore: hide contact column in CNR mode by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/48


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.6...v0.18.7

## [0.18.6](https://github.com/beabee-communityrm/monorepo/compare/v0.18.5...v0.18.6) (2024-08-13)

### What's Changed
* feat: Form.IO builder style improvements by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/46


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.5...v0.18.6

## [0.18.5](https://github.com/beabee-communityrm/monorepo/compare/v0.18.4...v0.18.5) (2024-08-08)

### What's Changed
* fix: complete all payment flows by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/45


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.4...v0.18.5

## [0.18.4](https://github.com/beabee-communityrm/monorepo/compare/v0.18.4-alpha.2...v0.18.4) (2024-08-07)

### What's Changed
* fix: skip merge field validation when updating Mailchimp by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/44


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.3...v0.18.4

## [0.18.4-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.18.4-alpha.1...v0.18.4-alpha.2) (2024-08-07) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.4-alpha.1...v0.18.4-alpha.2

## [0.18.4-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.18.3...v0.18.4-alpha.1) (2024-08-07) (Pre-release)

Skip merge field validation when updating Mailchimp contacts

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.3...v0.18.4-alpha.1

## [0.18.3](https://github.com/beabee-communityrm/monorepo/compare/v0.18.2...v0.18.3) (2024-08-07)

### What's Changed
* refactor: merge common contribution info into PaymentService by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/32
* fix: always complete join flow, even if no contribution by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/43


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.2...v0.18.3

## [0.18.2](https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.5...v0.18.2) (2024-08-02)

* Added support for newsletter groups in the join flow. Let your users decide which newsletters they want to receive :)
* Moved the password from the join form to the join setup page, and generally simplified the join form a bit

### What's Changed
* feat: support newsletter groups by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/34
* chore: add option for one-way sync by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/36
* fix: membership builder preview not loading by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/37
* feat: show newsletter group names, and move to new section by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/38
* feat: ask for password in join/survey flow by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/35
* feat: filter by newsletter groups by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/39
* chore: simplify join form by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/40
* feat: add groups to membership builder by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/41


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.1...v0.18.2

## [0.18.2-alpha.5](https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.4...v0.18.2-alpha.5) (2024-08-01) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.4...v0.18.2-alpha.5

## [0.18.2-alpha.4](https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.3...v0.18.2-alpha.4) (2024-08-01) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.3...v0.18.2-alpha.4

## [0.18.2-alpha.3](https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.2...v0.18.2-alpha.3) (2024-07-31) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.2...v0.18.2-alpha.3

## [0.18.2-alpha.2](https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.1...v0.18.2-alpha.2) (2024-07-31) (Pre-release)

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.2-alpha.1...v0.18.2-alpha.2

## [0.18.2-alpha.1](https://github.com/beabee-communityrm/monorepo/compare/v0.18.1...v0.18.2-alpha.1) (2024-07-31) (Pre-release)

Add newsletter group signup support, and move password input to join/survey

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.1...v0.18.2-alpha.1

## [0.18.1](https://github.com/beabee-communityrm/monorepo/compare/v0.18.0...v0.18.1) (2024-07-30)

### What's Changed
* build: support TS project references across workspaces by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/30
* build: fix build tests by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/31
* chore: remove legacy auto-archive feature by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/33


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.18.0...v0.18.1

## [0.18.0](https://github.com/beabee-communityrm/monorepo/compare/v0.17.1...v0.18.0) (2024-07-30)

Enable the Sales tax feature

### What's Changed
* feat: enable Sales tax  by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/27
* fix: select box dropdown overflowing by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/28
* fix: don't update cancelled or expired subscriptions by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/29


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.17.1...v0.18.0

## [0.17.1](https://github.com/beabee-communityrm/monorepo/compare/v0.17.0...v0.17.1) (2024-07-24)

### What's Changed
* fix: callout filter in segment cronjob by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/26


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.17.0...v0.17.1

## [0.17.0](https://github.com/beabee-communityrm/monorepo/compare/v0.16.10...v0.17.0) (2024-07-23)

### What's Changed
* build: improve new core dev experience by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/11
* build: move other services to core package by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/14
* refactor: clean up core by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/19
* build: simplify model export by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/18
* build: clean up docker build warning by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/25
* build: copy data to dist by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/24
* Merge v0.16.x changes by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/21


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.10...v0.17.0

## [0.16.10](https://github.com/beabee-communityrm/monorepo/compare/v0.16.9...v0.16.10) (2024-07-18)

### What's Changed
* chore: update i18n by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/23


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.9...v0.16.10

## [0.16.9](https://github.com/beabee-communityrm/monorepo/compare/v0.16.8...v0.16.9) (2024-07-18)

### What's Changed
* chore: update i18n by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/22


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.8...v0.16.9

## [0.16.8](https://github.com/beabee-communityrm/monorepo/compare/v0.16.7...v0.16.8) (2024-07-18)

### What's Changed
* fix: changes not persisting after reverting a callout to draft by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/20


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.7...v0.16.8

## [0.16.7](https://github.com/beabee-communityrm/monorepo/compare/v0.16.6...v0.16.7) (2024-07-17)

### What's Changed
* chore: improve SendGrid logging slightly by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/16
* fix: callout variants can't be removed by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/17


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.6...v0.16.7

## [0.16.6](https://github.com/beabee-communityrm/monorepo/compare/v0.16.5...v0.16.6) (2024-07-16)

### What's Changed
* fix: allow SendGrid to send more than 1,000 emails by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/15


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.5...v0.16.6

## [0.16.5](https://github.com/beabee-communityrm/monorepo/compare/v0.16.4...v0.16.5) (2024-07-09)

### What's Changed
* build: update iframe resize script by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/13


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.4...v0.16.5

## [0.16.4](https://github.com/beabee-communityrm/monorepo/compare/v0.16.3...v0.16.4) (2024-07-09)

### What's Changed
* fix: don't add min height for embeds by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/12


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.3...v0.16.4

## [0.16.3](https://github.com/beabee-communityrm/monorepo/compare/v0.16.2...v0.16.3) (2024-07-08)

### What's Changed
* build: move database migrations to core by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/10


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.2...v0.16.3

## [0.16.2](https://github.com/beabee-communityrm/monorepo/compare/v0.16.1...v0.16.2) (2024-07-08)

### What's Changed
* build: simplify Docker builds by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/6
* fix: send 500 when there is an internal error by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/8
* build: create core package by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/7
* fix: incorrect filter type for selectable components by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/9


**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.1...v0.16.2

## [0.16.1](https://github.com/beabee-communityrm/monorepo/compare/v0.16.0...v0.16.1) (2024-07-08)

Added support for contact filters based on responses to callouts.

### What's Changed
* chore(dependencies): Upgrade dependencies by @JumpLink in https://github.com/beabee-communityrm/monorepo/pull/3
* feat: add callout filters to contact by @wpf500 in https://github.com/beabee-communityrm/monorepo/pull/5

### New Contributors
* @wpf500 made their first contribution in https://github.com/beabee-communityrm/monorepo/pull/5

**Full Changelog**: https://github.com/beabee-communityrm/monorepo/compare/v0.16.0...v0.16.1

## [0.16.0](https://github.com/beabee-communityrm/monorepo/compare/v0.15.4...v0.16.0) (2024-06-04)

## First Beabee Monorepo Release

We are excited to announce the release of the Beabee Monorepo, a unified codebase that combines our backend, frontend, and common libraries into a single repository. This significant restructuring aims to streamline our development processes and enhance development speed.

This is a pre-release to test whether the release process still works. Full releases will follow.

### Highlights of the Release:

- **Unified Codebase**: The backend, frontend, and common libraries are now housed under one roof, making it easier to manage dependencies and coordinate changes across teams.

- **Docker Integration**: We have migrated all Docker configurations from the individual repositories to the monorepo. This ensures a consistent and seamless environment for development and deployment.

- **GitHub Actions**: All continuous integration and deployment workflows have been consolidated into this monorepo using GitHub Actions, providing robust automation and efficiency in our operations.

- **Migration to Yarn**: Transitioning from npm to Yarn, we are now leveraging Yarn Workspaces. This allows us to manage the three packages more effectively, with simplified dependency management and faster installations.

## Just the beginning

Further optimisations are planned as development progresses. For example, additional repositories could be added and the advantages of a monorepo could be further utilised and expanded.

## [0.15.4](https://github.com/beabee-communityrm/monorepo/compare/v0.15.3...v0.15.4) (2024-06-04) (Pre-release)

Second release try to test the release on the monorepo

## [0.15.3](https://github.com/beabee-communityrm/monorepo/releases/tag/v0.15.3) (2024-05-31) (Pre-release)

## First Beabee Monorepo Release

We are excited to announce the release of the Beabee Monorepo, a unified codebase that combines our backend, frontend, and common libraries into a single repository. This significant restructuring aims to streamline our development processes and enhance development speed.

This is a pre-release to test whether the release process still works. Full releases will follow.

### Highlights of the Release:

- **Unified Codebase**: The backend, frontend, and common libraries are now housed under one roof, making it easier to manage dependencies and coordinate changes across teams.

- **Docker Integration**: We have migrated all Docker configurations from the individual repositories to the monorepo. This ensures a consistent and seamless environment for development and deployment.

- **GitHub Actions**: All continuous integration and deployment workflows have been consolidated into this monorepo using GitHub Actions, providing robust automation and efficiency in our operations.

- **Migration to Yarn**: Transitioning from npm to Yarn, we are now leveraging Yarn Workspaces. This allows us to manage the three packages more effectively, with simplified dependency management and faster installations.

## Just the beginning

Further optimisations are planned as development progresses. For example, additional repositories could be added and the advantages of a monorepo could be further utilised and expanded.
