# OIDC login and identity provider integration

Design note for moving a beabee instance's authentication to an external
identity provider (IdP). Terms are defined in [`CONTEXT.md`](../CONTEXT.md);
the decisions a reader is most likely to question are recorded in
[`docs/adr/`](./adr/). This page ties them together and is the reference for
the pull request stack that implements them.

## Instance states

Two independent provider switches give three supported states. Any other
combination fails at boot.

| State          | `BEABEE_LOGIN_PROVIDER` | `BEABEE_IDP_PROVIDER`  | Members log in with |
| -------------- | ----------------------- | ---------------------- | ------------------- |
| Standalone     | `local`                 | `none`                 | beabee password     |
| IdP Transition | `local`                 | `zitadel` / `keycloak` | beabee password     |
| OIDC           | `oidc`                  | `zitadel` / `keycloak` | the IdP             |

Local Login and OIDC Login are never offered side by side. Moving from
Standalone to OIDC always passes through the IdP Transition.

## Principles

- **beabee is the system of record.** Contacts are created in beabee and
  mirrored to the IdP (IdP Provisioning); the IdP, payment and newsletter
  providers are all fed from the contact. Members have no way to edit their
  data at the IdP: its Console is hidden from them
  ([ADR-0005](./adr/0005-hide-the-idp-console-from-members.md)).
- **Linking is by IdP Subject only.** Login never matches by email and never
  creates a contact ([ADR-0001](./adr/0001-link-contacts-to-idp-by-subject-only.md)).
- **One IdP per beabee instance.** Each tenant has a dedicated Zitadel
  virtual instance (or Keycloak realm in development); one service user with
  `IAM_OWNER` on that instance is the only credential beabee holds.
- **IdP failures never block members.** Provisioning errors are logged at
  error level for the operators and reconciled with the CLI; admins are not
  shown them. Admin-facing pages show read-only link status only.
- **Zitadel is the production target.** Keycloak exists for local
  development; it gets the same features only where they are cheap.

## Flows

**Login (OIDC state).** `GET /auth/login` starts an authorization-code flow
with PKCE, state and nonce; the callback looks up the contact by IdP Subject
and establishes the normal session. Unlinked Contacts are logged out of the
IdP again and see an "unlinked account" error, so their next attempt starts
at the IdP's login form. Logout ends the IdP session as well (RP-initiated
logout): `POST /auth/logout` ends the beabee session and answers with the
IdP's logout URL for the client to navigate to, `GET /auth/logout` does the
same in one step for plain links. Local-auth endpoints (password, MFA,
reset) return 404.

**Joining (OIDC state).** The setup form has no password field. After the
confirm-email link, beabee finalises the Signup Flow, starts an OIDC login
that continues to the setup page, and hands the member to the IdP's
credential setup page inside that login: Zitadel's Login v2 invite page
with an invite code obtained via API (password or passkey), or in
development a Keycloak magic link carrying the login's parameters. The IdP
completes the login and the member arrives at the setup page through
beabee's normal OIDC callback. Clicking the confirmation link again after an
abandoned setup starts a fresh login and invite.

**Account management (OIDC state).** beabee's account page offers three
actions — change password, add a passkey, set up an authenticator app — each
an OIDC login that beabee starts with a Login Action
(`GET /auth/login?action=…`). The provider enters the matching Login v2 page
(`/password/change`, `/passkey/set`, `/mfa/set`) inside that login, or in
development Keycloak's application initiated action. They work off the
member's existing login session, ask for the current password where needed,
and return to the account page through the OIDC callback
([ADR-0004](./adr/0004-link-to-login-v2-self-service-flows.md)). Removing a
passkey or authenticator app has no Login v2 page, so beabee's account page
does it through the provider's API instead: it shows which methods are set
up and removes one after a fresh login at the IdP (`prompt=login`, recent
`auth_time`), so that a hijacked session cannot strip a second factor.
Operators can still remove them in the Console
([ADR-0005](./adr/0005-hide-the-idp-console-from-members.md)).

**IdP Transition and cutover.** Existing password hashes cannot be imported
into Zitadel ([ADR-0003](./adr/0003-migrate-passwords-by-capturing-at-login.md)).
Instead, at transition start operators provision all contacts and clear all
sessions; from then on every plaintext password beabee handles (login, join
setup, reset, change) is mirrored to the IdP and the contact's "credential
mirrored at" timestamp is set. Operators watch the unsynced count and cut
over by switching `BEABEE_LOGIN_PROVIDER` to `oidc`. Members who never
logged in during the transition use the IdP's password reset. Local hashes
are kept as the break-glass (revert the env var) and cleared later with the
CLI once no longer needed.

**Branding.** The instance's label policy is set from the beabee theme: the
main, body, danger and white colours map to Zitadel's primary, font, warn and
background colours (light and dark alike, theme mode forced light) plus the
logo as logo and icon. Pushed on every settings save and by the CLI. Fonts
and the splash background image are not synced for now (Zitadel has one font
file per instance and no per-instance background before v5).

## Configuration

Login: `BEABEE_LOGIN_PROVIDER=local|oidc` with `BEABEE_LOGIN_SETTINGS_`
`ISSUER`, `CLIENTID`, `CLIENTSECRET` (empty = public client), `SCOPES`,
`REDIRECTURI`, `POSTLOGOUTREDIRECTURI`.

Provisioning: `BEABEE_IDP_PROVIDER=none|zitadel|keycloak` with
`BEABEE_IDP_SETTINGS_` `URL`, `PAT` (Zitadel) or `URL`, `REALM`, `CLIENTID`,
`CLIENTSECRET` (Keycloak).

IdP-side setup that beabee owns and applies idempotently via
`backend-cli idp setup`: `defaultRedirectUri` (beabee's login endpoint, the
safety net for a member who finishes a Login v2 page outside a login beabee
started), `ignoreUnknownUsernames` and branding. The virtual instance, project and OIDC client are created by the
hosting infrastructure, which is expected to call the same command in future.

## Operations

**Enabling OIDC Login** on an instance is the last step of the IdP
Transition: with provisioning already running and the unsynced count
acceptable, set `BEABEE_LOGIN_PROVIDER=oidc` plus the
`BEABEE_LOGIN_SETTINGS_*` values, clear all sessions and redeploy. The
backend refuses to start if `BEABEE_IDP_PROVIDER` is `none` at that point.
Clearing the sessions makes every member log in through the IdP, so each
session carries the ID token that logout uses as its hint; a session from
before the cutover would log out of beabee only.

**Break-glass.** If the IdP is unreachable or misconfigured nobody can log in,
operators included. The way back is to set `BEABEE_LOGIN_PROVIDER=local` and
redeploy: local password hashes are kept for exactly this reason, so members
who haven't changed their password at the IdP since can log in as before. The
OIDC discovery result is cached for the process lifetime; a restart picks up
changed IdP metadata.

**Upgrading Login v2.** beabee enters Login v2 pages with the ID of an
authorization request it started, which Login v2's source supports but its
documentation does not promise
([ADR-0004](./adr/0004-link-to-login-v2-self-service-flows.md)). After a
Login v2 upgrade, check that it still holds: request the instance's OIDC
authorize URL with the tenant's client and read the `authRequest` ID from
the redirect, open
`/ui/v2/login/password/change?requestId=oidc_<id>&loginName=<login name>`
in a browser logged in at the IdP, change the password, and confirm the
browser lands on beabee's `/api/1.0/auth/callback` with `code` and the
original `state`. If it doesn't, members finishing a page land on the
`defaultRedirectUri` instead of where they started.

**Hiding the Console.** The hosting infrastructure blocks `/ui/console` on
the tenant's login domain and redirects it to the tenant's beabee URL;
operators use the Console on the instance's generated domain instead, which
is also where they remove a member's passkey or authenticator app on request.
The IdP's password-change notification is switched off in its notification
policy, as the mail would link to the Console.

## Pull request stack

Branches stack on each other in this order; each PR targets the previous
branch and is retargeted to `main` as its base merges.

1. `feat/idp-provider` — contact link column, provider abstraction and
   service, provisioning triggers, linking CLI, admin link status
2. `feat/idp-keycloak` — Keycloak provider and local development stack
3. `feat/idp-zitadel` — Zitadel provider
4. `feat/oidc-login-backend` — login provider config, OIDC routes, local-auth
   404s, client helpers
5. `feat/oidc-login-frontend` — login, logout and route guards in both
   frontends
6. `feat/oidc-account` — account page links to the IdP's self-service pages
7. `feat/oidc-signup` — join flow
8. `feat/oidc-self-service-removal` — authentication method status and
   removal on the account page, behind a fresh IdP login
9. `feat/idp-setup` — branding sync and `idp setup`
10. `feat/idp-transition` — password mirroring, session clearing, unsynced
   count, hash clean-up

## Deliberately out of scope

Password hash import; a cutover mail-out; offering both login methods at
once; export for tenants leaving the hosting; font and background sync;
Keycloak branding; the legacy frontend; enforcing multi-factor
authentication.
