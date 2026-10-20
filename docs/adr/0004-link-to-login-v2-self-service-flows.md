# Send members to Login v2 flows for credential management, not to a portal

Members need to change their password and add a passkey or authenticator
app. Zitadel's only hosted account UI is its management Console, which cannot
be reduced by configuration to those three actions and is far too complex for
members. Instead, beabee's account page sends each action to the
corresponding page of Zitadel's Login v2 (`/password/change`, `/passkey/set`,
`/mfa/set`), entered inside an OIDC login that beabee starts: beabee follows
the authorization request's redirect to Login v2 once to obtain the request
ID and opens the page with it, so Login v2 completes the request when the
page is done and the member returns through beabee's normal OIDC callback.
beabee therefore still never handles credentials, and there is no UI of our
own to maintain.

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

- Each action is a `GET /auth/login?action=…` request to beabee; the
  provider builds the IdP page from its own settings, and nothing is
  configured for it.
- Every flow returns through the OIDC callback with the `next` path beabee
  chose, so the account page and the join flow each get their member back
  where they started. The join flow's credential setup (invite code on the
  `/verify` page) rides on the same mechanism.
- Two pieces are documented Zitadel contracts: handing an authorization
  request to a login UI as `?authRequest=<id>`, and completing a request
  with a session (`POST /v2/oidc/auth_requests/{id}`). Two are read from
  the Login v2 source, not from documentation: that its pages accept the
  request as `requestId=oidc_<id>`, and that they complete it when done. If
  a Login v2 release drops that, the pages still work and the member lands
  on the instance's `defaultRedirectUri` instead of returning to beabee,
  which is why `idp setup` keeps pointing it at beabee's login endpoint.
  Upgrading Login v2 includes the check in the design note's operations
  section.
- `/otp/email/set` and `/otp/sms/set` must not be linked: they enrol on page
  load.
