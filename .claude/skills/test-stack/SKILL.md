---
name: test-stack
description: Start the docker-compose.test.yml stack on :4002 and run tests or requests against it. Use when running apps/e2e-api-tests or apps/browser-tests, calling the local API with curl, or measuring a backend container's memory.
---

# Test stack

`apps/e2e-api-tests` (vitest) and `apps/browser-tests` (Playwright) run against a live stack on http://localhost:4002, seeded from `packages/test-utils/fixtures/*.sql`. CI's steps in `.github/actions/test-setup/action.yml` are authoritative; the steps below are the minimal local version.

## Start

1. Env files are git-ignored: copy `.env.example` → `.env` and `.env.test.example` → `.env.test` if missing.
2. Run every compose command with `COMPOSE_PROJECT_NAME=<worktree name> ROUTER_PORT=4002 docker compose -f docker-compose.test.yml`, so parallel worktrees don't share containers.
3. `build api_app app_router` → `up -d db` → `run --rm --no-deps migration` → `up -d --no-deps api_app app_router`. Browser tests also need `frontend` and `webhook_app` in the `build` and `up` lists.
4. Seed: pipe `packages/test-utils/fixtures/test-db-default.sql` into `exec -T api_app yarn backend-cli database import`.

Done when http://localhost:4002 answers. Containers vanish on reboot while the db volume persists, so check before assuming the stack is up.

## Run

- Backend services run your local build (`dist` mounts + `node --watch`), so `yarn build` is enough. `frontend`, `app_router` and `cron_app` run what is baked into their image: after a change, `build <service>` + `up -d <service>`.
- Tests reading `process.env.BEABEE_SERVICE_SECRET` need it exported from `.env.test`.
- Stripe-dependent tests need `test-db-custom.sql` (see the CI action) and real test-mode secrets; run those files one at a time.
- `curl` drops the `Domain=localhost` session cookie: pass it with `-H 'Cookie: …'`.

## Memory measurements

V8 sizes its heap from the container's memory limit. Measure with `docker run --memory=<limit from the helm chart's values.yaml>`; without a limit a backend container shows a ~310 MiB startup spike that production never has.
