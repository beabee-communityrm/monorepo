# The CLI authenticates as an Operator with the service secret, not an API key

The backend CLI is a thin client of the API and must act with every role,
including superadmin, for bootstrap tasks such as creating the first admin or
the first API key. API keys cannot do that: they are fixed to the admin role
and can only be created by a superadmin session, which does not exist on a
fresh instance. We decided that the CLI signs a short-lived JWT with
`BEABEE_SERVICE_SECRET`, the secret the services of one instance already share
for their internal reload channel, and that the API accepts it as Operator
Auth with all roles. An API key remains possible for remote use and is
deliberately limited to admin, so operator-level actions only happen inside
the instance's infrastructure.

## Considered Options

- **Trust requests from localhost or the internal network.** Rejected: the
  cron container is not loopback, and the source IP behind the router is not
  reliable with `trust proxy` enabled.
- **A separate CLI secret.** Rejected: a second secret to provision and rotate
  with no security gain over the one the services already trust each other
  with.
- **Extend API keys to carry superadmin.** Rejected: it would remove the
  guarantee that no API credential can ever grant superadmin.

## Consequences

- The service secret is a superadmin credential. It stays inside the
  instance's containers and is never placed on operator laptops.
- Commands that need superadmin (`api-key create`, `setup admin`, granting the
  superadmin role) work only with Operator Auth, never with an API key.
- Jobs are superadmin operations, so an API key cannot run them and the CLI
  needs Operator Auth for them. A job that exposes infrastructure secrets can
  additionally be marked as operator-only when the need arises.
