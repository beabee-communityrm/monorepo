# CI and Deployment

Pull requests are checked on every push, but the expensive tests only run in GitHub's merge queue. A PR merges only if every required check passes on the merge commit, and every commit on `main` deploys.

```
PR push ──► check-and-unit-tests, lint ──► approval ──► merge queue: check-and-unit-tests, run-api-tests, run-browser-tests ──► main ──► Deploy
```

## Workflows

| Workflow | Runs on | Does |
|---|---|---|
| `check.yml` → `check-and-unit-tests` | every PR push, merge queue | `yarn check` (types, lint, formatting) and `yarn test` (unit tests) |
| `lint-pr-title.yml` → `lint` | PR opened or edited | PR title is a conventional commit |
| `test-api.yml` → `run-api-tests` | merge queue, manual | API tests against the `docker-compose.test.yml` stack |
| `test-browser.yml` → `run-browser-tests` | merge queue, manual | Playwright tests against the same stack |
| `deploy.yml` | push to `main` or `dev`, tags `v*` | builds and pushes the Docker images |
| `database-report.yml` | push to `main`, manual | SchemaSpy report of the database schema |
| `publish-npm.yml` | GitHub release, manual | see [Release Workflow](release-workflow.md) |

The two E2E workflows also trigger on `pull_request`, but their jobs are skipped there. A PR has to show every required check before it can join the queue, and a skipped job counts as passed. The queue then runs them for real.

## Merging a pull request

1. Get one approval. Pushing a new commit dismisses it.
2. Click **Merge when ready**. The PR joins the queue, and GitHub tests it merged with `main` and any PRs queued ahead of it.
3. If all checks pass, GitHub merges it. If one fails, the PR leaves the queue: fix it, get it approved again and queue it again.

To see test results before queueing, run the test workflows by hand on your branch (Actions → workflow → **Run workflow**). These runs show on the commit but not on the PR, and the queue runs the tests again regardless.

## Repository settings

These live in the GitHub settings, not in this repository:

- **Ruleset on `main`:** merge queue (merge method MERGE), 1 approval, and the required checks `check-and-unit-tests`, `run-api-tests` and `run-browser-tests`. The E2E jobs are skipped on PRs, so without the merge queue these required checks would pass without any tests running.
- **Merge commit message:** must be the PR title, see [Release Workflow](release-workflow.md#required-github-repo-setting).

## Deployment

`deploy.yml` builds `beabee-api-app`, `beabee-webhook-app`, `beabee-legacy-app`, `beabee-cron-app`, `beabee-frontend` and `beabee-router`, and pushes each as `sha-<commit>`. Once every image exists, `publish-tags` adds the public tags, `beabee-api-app` last: the cluster rolls out when a new tag appears on that image and expects the tag on all the others.

| Tag | Added on |
|---|---|
| `latest`, `main-<run>-<sha>` | push to `main` |
| `dev`, `dev-<run>-<sha>` | push to `dev` |
| `vX.Y.Z` | tag `vX.Y.Z` |
| `release` | tag `vX.Y.Z` without a pre-release suffix |

Deploy runs no tests itself: commits on `main` have passed the queue, and release tags are cut from `main`.

`dev` deploys to the hosted dev environment. To try a feature branch there, merge it into `dev` and push; several branches can be on `dev` at once. `dev` has no queue or required checks, so a failing test doesn't stop a dev deploy, but a type error does, because the Docker builds compile the code.

## When a test fails

The failed run has these artifacts:

- `playwright-report` (browser tests, always uploaded)
- `database`: a dump of the test database, and `docker-compose-logs` (both test workflows, only on failure)

To reproduce a failure locally, start the stack the way `.github/actions/test-setup/action.yml` does, then run `yarn workspace @beabee/e2e-api-tests test` or follow [`apps/browser-tests/README.md`](../apps/browser-tests/README.md).

## Secrets

| Secret | Used by |
|---|---|
| `BEABEE_STRIPE_PUBLICKEY`, `BEABEE_STRIPE_SECRETKEY`, `BEABEE_STRIPE_MEMBERSHIPPRODUCTID` | test workflows, Stripe test mode |
| `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `DOCKER_ORGANISATION` | `deploy.yml`, Docker Hub |
