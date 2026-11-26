---
name: test-stack
description: Start the docker-compose.test.yml stack on :4002 and run tests or requests against it. Use when running apps/e2e-api-tests or apps/browser-tests, calling the local API with curl, or measuring a backend container's memory.
---

# Test stack

`apps/e2e-api-tests` (vitest) and `apps/browser-tests` (Playwright) run against a live stack on http://localhost:4002, seeded from `packages/test-utils/fixtures/*.sql`. CI's steps in `.github/actions/test-setup/action.yml` are authoritative; the steps below are the minimal local version.

## Start

1. Env files are git-ignored: copy `.env.example` → `.env` and `.env.test.example` → `.env.test` if missing, and fill in your Stripe test keys: `BEABEE_STRIPE_PUBLICKEY` + `BEABEE_STRIPE_SECRETKEY` in `.env`, `BEABEE_STRIPE_WEBHOOKSECRET` + `BEABEE_STRIPE_MEMBERSHIPPRODUCTID` in `.env.test`.
2. Run every compose command with `COMPOSE_PROJECT_NAME=<worktree name> ROUTER_PORT=4002 docker compose -f docker-compose.test.yml`, so parallel worktrees don't share containers.
3. `build api_app app_router` → `up -d db` → `run --rm --no-deps migration` → `up -d --no-deps api_app app_router`. Browser tests also need `frontend` and `webhook_app` in the `build` and `up` lists. Stripe tests (`yarn workspace @beabee/e2e-api-tests test:stripe`) need `webhook_app` built and `webhook_app` + `stripe_cli` up; they read `.env` + `.env.test` themselves.
4. Seed: pipe `packages/test-utils/fixtures/test-db-default.sql` into `exec -T api_app yarn backend-cli database import --danger`, then `test-db-custom.sql` with its `__stripeWebhookSecret__` / `__stripeProductId__` placeholders replaced by those `.env.test` values (same `sed` as the CI action). Restart the app services afterwards: they cache options at startup.

Done when http://localhost:4002 answers. Containers vanish on reboot while the db volume persists, so check before assuming the stack is up.

## Run

- Backend services run your local build (`dist` mounts + `node --watch`), so `yarn build` is enough. `frontend`, `app_router` and `cron_app` run what is baked into their image: after a change, `build <service>` + `up -d <service>`.
- `curl` drops the `Domain=localhost` session cookie: pass it with `-H 'Cookie: …'`.

## Memory measurements

V8 sizes its heap from the container's memory limit. Measure with `docker run --memory=<limit from the helm chart's values.yaml>`; without a limit a backend container shows a ~310 MiB startup spike that production never has.
