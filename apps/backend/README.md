# 🐝 beabee

Welcome to the official GitHub repository for beabee, where you'll find both the backend API and the legacy frontend application for beabee. Discover more about beabee by visiting our website at [beabee.io](https://beabee.io/en/home/).

beabee was initially developed for the [South London Makerspace](http://southlondonmakerspace.org) and later adapted for use by [The Bristol Cable](https://thebristolcable.org).

Your input is invaluable to us as we continue to grow and improve beabee. Don't hesitate to get in touch!

## 💻 Install

> ⚠️⚠️⚠️ **WARNING** ⚠️⚠️⚠️
>
> If you want to deploy beabee on a server refer to
> [beabee/beabee-deploy](https://github.com/beabee-communityrm/beabee-deploy/)
> instead. The instructions below are for running beabee locally for development

You need:

- Docker >= 19.03.8
- Docker Compose >= 2
- Node.js >= 20.10.0

NOTE: Lower non-major versions probably work but haven't been tested

To just look around the system you can just use the example env file (`.env.example`) as is, but you'll need to
create a sandbox GoCardless account to test any payment flows.

```bash
yarn install
yarn build
docker compose -f ../../docker-compose.yml build

# Initialise database
docker compose -f ../../docker-compose.yml up -d db
docker compose -f ../../docker-compose.yml run --rm app yarn typeorm migration:run

# Do the rest
docker compose -f ../../docker-compose.yml up -d
```

### To get started

#### Create a new super admin

```bash
docker compose -f ../../docker-compose.yml run --rm app node built/tools/new-user
```

#### Payment methods and email domain

```bash
docker compose -f ../../docker-compose.yml exec app node built/tools/configure
```

> ⚠️ If you only set up the system locally, it doesn't matter what email domain you specify, but it still has to be valid, e.g. `example.org`.

#### Import some data

Need some test data? Download it here: coming soon

```bash
docker compose -f ../../docker-compose.yml run --rm -T app node built/tools/database/import.js < <import file>
```

#### Go to the frontend

Now [check out the frontend](../frontend) in parallel in a separate directory and start it as described in the README.md.

By default, this should now be accessible via http://localhost:3000 and communicate with the backend API over http://localhost:3002.

## `</>` Development

Development is containerized, in general you should be able to use the following to get started

```bash
yarn dev
```

You can also use the following when just working on the API (faster reloading)

```bash
yarn dev:api
```

#### Rebuilding containers

If you make changes to `.env` you need to recreate the Docker containers

```bash
docker compose -f ../../docker-compose.yml up -d
```

docker compose -f ../../docker-compose.yml up -d

````

If you change the dependencies in `package.json` you must rebuild and recreate the Docker containers

```bash
docker compose -f ../../docker-compose.yml build
docker compose -f ../../docker-compose.yml up -d
````

#### Generating database migrations

Whenever you make changes to a database model, you need to create a migration
file. TypeORM will automatically generate a migration file based on your schema
changes

```bash
docker compose -f ../../docker-compose.yml start db
docker compose -f ../../docker-compose.yml run app yarn typeorm migration:generate /opt/packages/core/src/migrations/MigrationName && yarn format
yarn build
docker compose -f ../../docker-compose.yml run app yarn typeorm migration:run
```

If you are still in the development phase, you may want to undo your last database migration as follows:

```bash
docker compose -f ../../docker-compose.yml run app yarn typeorm migration:revert
```

To find out more about this topic, take a look at the [TypeORM Migration Guide](https://typeorm.io/migrations).

### 📰 Documentation

The codebase is broadly split into a few different parts

- **beabee core**

  Shared between all services (API, webhooks and legacy)

```
./src/core
./src/models - Data models and database entities
./src/config - Config loader
```

- **API service**

```
./src/api
```

- **Webhook service**

Handlers for webhooks from beabee's integrations (currently GoCardless, Mailchimp and Stripe)

```
./src/webhook
```

- **Legacy app**

This is slowly being removed, with business logic being moved into the API and frontend into the [new frontend](../frontend).

```
./src/apps
./src/static
./src/views
```

- **Tools**

Various tools for administration, including nightly cron jobs

```
./src/tools
```

#### 📡 Webhooks

Webhooks are handled by the `webhook_app` service. This is a separate service from the API to allow for scaling independently.

**`/webhook/ping`** - Used to check if the webhook service is running and available, e.g. http://localhost:3001/webhook/ping

**`/webhook/stripe`** - Stripe webhooks are handled by the `stripe` service, see [Payment Providers](#payment-providers) for more information.

**`/webhook/gocardless`** - GoCardless webhooks are handled by the `gocardless` service, see [Payment Providers](#payment-providers) for more information.

**`/webhook/mailchimp`** - Mailchimp webhooks are handled by the `mailchimp` service, see [MailChimp](#mailchimp) for more information.

### 📧 E-mail

#### Prepare for local development

By default we are using [MailDev](https://github.com/maildev/maildev) for local development. For this to work it must be configured the first time, run the following command if not already done:

```bash
docker compose -f ../../docker-compose.yml exec app node built/tools/configure
```

If the Docker Compose Stack is started, you can reach MailDev via http://localhost:3025/ by default. If you now receive an e-mail during your tests, you will find it there.

#### 📮 MailChimp

MailChimp is used for sending newsletters and other marketing emails.

To be able to send emails you need to create a MailChimp account and create a new API key in the [MailChimp dashboard](https://mailchimp.com/).

The API key can be found in the MailChimp dashboard under the API keys section.

### 💰 Payment Providers

We are using stripe for membership payments.

#### Prepare for local development

Make sure you have defined the environment variables in the .env file:

```bash
BEABEE_STRIPE_PUBLICKEY=<public key>
BEABEE_STRIPE_SECRETKEY=<secret key>
```

And also that you have configured the payment methods using

```bash
docker compose -f ../../docker-compose.yml exec app node built/tools/configure
```

You can get the public key and secret key in the [Stripe dashboard](https://dashboard.stripe.com).

To be able to receive webhooks from stripe you need to forward them to your local environment and create a webhook secret using the [Stripe CLI](https://docs.stripe.com/stripe-cli):

```bash
stripe login
stripe listen --forward-to localhost:3001/webhook/stripe
```

Now the stripe CLI prints out the webhook secret, copy it and add it to the .env file while you keep the forwarding process running:

```bash
BEABEE_STRIPE_WEBHOOKSECRET=<webhook secret>
```

##### Testing payment

To test payments you can use the following credit card details:

```bash
Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

> ⚠️ To be able to create a payment in the frontend you need to be able to receive confirmation emails, so make sure you have setup [E-Mail](#email).

> ⚠️ Since the environment variable has changed you also need to [rebuild the containers](#rebuilding-containers).
