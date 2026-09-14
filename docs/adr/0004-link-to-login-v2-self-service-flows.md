# Send members to Login v2 flows for credential management, not to a portal

Members need to change their password and add a passkey or authenticator
app. Zitadel's only hosted account UI is its management Console, which cannot
be reduced by configuration to those three actions and is far too complex for
members. Instead, beabee's account page links each action to the
corresponding page of Zitadel's Login v2 (`/password/change`, `/passkey/set`,
`/mfa/set`), which works for a member with an active login session and
returns to beabee via the instance's default redirect URI. beabee therefore
still never handles credentials, and there is no UI of our own to maintain.

## Considered Options

- **Console deep link** (`/ui/console/users/me?id=security`) — zero effort,
  but exposes six admin-style tabs and cannot be trimmed; kept only as the
  escape hatch for removing an authenticator, which Login v2 has no page for.
- **Hide Console parts with injected CSS or proxy path blocking** — cosmetic,
  unsupported, breaks across Zitadel releases, and the underlying API stays
  open.
- **Own account page on the User v2 API with the member's token** — keeps
  credentials out of beabee and could also list and remove authenticators,
  but is code we would own; deferred until members demonstrably need removal.
- **Fork Login v2 or build a standalone account app** — ongoing maintenance
  of a security-sensitive codebase for a page Zitadel has said it will
  provide as components.

## Consequences

- The account page derives the links from the OIDC issuer; no separate
  account URL is configured.
- Every self-service flow returns to the same fixed beabee page, because
  Login v2 has no per-link return URL.
- `/otp/email/set` and `/otp/sms/set` must not be linked: they enrol on page
  load.
