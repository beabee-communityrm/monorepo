# @beabee/browser-tests

Playwright browser tests for the Beabee frontend. Tests run against Firefox (Desktop) by default. A setup project handles authentication before the test suite runs.

## Prerequisites

A running Beabee instance (default: `http://localhost:4002/`). Override by changing `playwright.config.ts`

## Running tests

```sh
# Run all tests (headless, with trace on failure)
yarn workspace @beabee/browser-tests test

# Run with interactive UI
yarn workspace @beabee/browser-tests test:ui
```

## Recording new tests

```sh
yarn workspace @beabee/browser-tests playwright codegen localhost:3000
```

## Project structure

```
src/tests/
  setup/
    auth.setup.ts       # Authenticates admin + non-admin users, stores auth state to .auth/
    auth-states.ts      # Exports paths to stored auth state files
  *.spec.ts             # Test files
.auth/                  # Stored authentication state (git-ignored)
playwright.config.ts
```

## Configuration

| Option                | Default                  | Description                                                               |
| --------------------- | ------------------------ | ------------------------------------------------------------------------- |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:4002/` | Base URL for the running instance                                         |
| `workers`             | `4`                      | Parallel file-level concurrency (tests within a file always run serially) |
| `trace`               | `retain-on-failure`      | Playwright trace mode                                                     |
| `screenshot`          | `only-on-failure`        | Screenshot capture mode                                                   |

Reports are written to `playwright-report/` and test artifacts to `test-results/`.
