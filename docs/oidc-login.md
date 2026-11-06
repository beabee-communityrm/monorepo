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
same in one step for plain links. The IdP returns to
`GET /auth/logout/callback`, which continues to the `next` that travelled
through the IdP as the end-session `state`. Local-auth endpoints (password, MFA,
reset) return 404.

In the diagrams, "Zitadel" is the OIDC endpoints and the management API,
"Login v2" the separate login UI: the browser talks to Login v2, beabee
talks to Zitadel. The token exchange is the only server-to-server step of a
login; everything else is a browser redirect.

```mermaid
sequenceDiagram
    participant B as Browser
    participant BE as beabee
    participant Z as Zitadel
    participant L as Login v2

    B->>BE: GET /api/1.0/auth/login?next=/profile
    Note over BE: PKCE verifier, state, nonce → session.oidc
    BE-->>B: 302 /oauth/v2/authorize?client_id&redirect_uri&state&code_challenge
    B->>Z: GET /oauth/v2/authorize
    Z-->>B: 302 /ui/v2/login/login?authRequest=V2_…
    B->>L: login form, password or passkey
    L-->>B: 302 /api/1.0/auth/callback?code&state
    B->>BE: GET /api/1.0/auth/callback?code&state
    BE->>Z: POST /oauth/v2/token (code, code_verifier)
    Z-->>BE: id_token (sub, auth_time)
    Note over BE: contact by idpSubject = sub<br/>session: idToken, authTime<br/>cookies: session, session-idp, site login
    alt contact linked
        BE-->>B: 302 next
    else no contact for sub
        BE-->>B: 302 end_session (state=/auth/login-error?code=unlinked-account)
        Note over B,Z: logout flow below, ending on the error page
    end
```

```mermaid
sequenceDiagram
    participant B as Browser
    participant BE as beabee
    participant Z as Zitadel

    B->>BE: POST /api/1.0/auth/logout (or GET ?next=…)
    Note over BE: destroy session, clear all three cookies
    BE-->>B: { redirectUrl } or 302:<br/>/oidc/v1/end_session?id_token_hint&post_logout_redirect_uri=…/auth/logout/callback&state=next
    B->>Z: GET /oidc/v1/end_session
    Note over Z: ends the IdP session, no confirmation thanks to the hint
    Z-->>B: 302 /api/1.0/auth/logout/callback?state=next
    B->>BE: GET /api/1.0/auth/logout/callback?state=next
    Note over BE: state validated as internal path or trusted origin
    BE-->>B: 302 next
```

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
development Keycloak's application initiated action. Adding a login method
is as sensitive as removing one, so an action needs a login at the IdP from
the last two hours (recent `auth_time`), like removal below. The pages
also work on the IdP's own login session, which the browser can lose while
beabee's lives on (Login v2 keeps it in a cookie that ends with the
browser); beabee mirrors that cookie with one of its own, set by the OIDC
callback without maxAge. An action without both first goes through a fresh
login (`prompt=login`, returning to the action), which carries the member's
email as `login_hint` so the IdP skips its login name form. The pages ask
for the current password where needed and return to the account page
through the OIDC callback
([ADR-0004](./adr/0004-link-to-login-v2-self-service-flows.md)). Removing a
passkey or authenticator app has no Login v2 page, so beabee's account page
does it through the provider's API instead: it shows which methods are set
up and removes one after a fresh login at the IdP (`prompt=login`, recent
`auth_time`), so that a hijacked session cannot strip a second factor.
Operators can still remove them in the Console
([ADR-0005](./adr/0005-hide-the-idp-console-from-members.md)).

beabee requests the authorize endpoint itself only to obtain the
`authRequest` ID; the browser then opens the Login v2 page directly with
that ID, and Login v2 completes the login beabee started.

```mermaid
sequenceDiagram
    participant B as Browser
    participant BE as beabee
    participant Z as Zitadel
    participant L as Login v2

    B->>BE: GET /api/1.0/auth/login?action=changePassword
    alt no fresh IdP session (session-idp cookie + auth_time < 2h)
        Note over BE: next = this URL, action dropped
        BE-->>B: 302 authorize?prompt=login&login_hint=email
        Note over B,L: login flow above, then back here
    end
    BE->>Z: GET /oauth/v2/authorize (redirect: manual)
    Z-->>BE: 302 Location: …?authRequest=V2_x
    BE->>Z: GET /v2/users/{sub} (PAT) → login name
    BE-->>B: 302 /ui/v2/login/password/change?requestId=oidc_V2_x&loginName=…
    B->>L: change password
    L-->>B: 302 /api/1.0/auth/callback?code&state
    Note over B,Z: callback as in the login flow, lands on /profile/account?tab=security
```

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
logo as logo and icon. Pushed when the theme or logo is saved and by the
CLI. Fonts and the splash background image are not synced for now (Zitadel
has one font file per instance and no per-instance background before v5).

**Server-to-server.** Provisioning and the account page's method removal
use the instance PAT; the login flows do not, apart from the login name
lookup above. The role claim runs the other way: Zitadel calls beabee's
webhook app while issuing the token.

```mermaid
sequenceDiagram
    participant BE as beabee
    participant Z as Zitadel
    participant WH as beabee webhooks

    Note over BE,Z: Provisioning, with the instance PAT
    BE->>Z: POST /v2/users/human (contact created)
    Z-->>BE: userId → contact.idpSubject
    BE->>Z: PATCH /v2/users/{sub} (email, name changed)
    BE->>Z: DELETE /v2/users/{sub} (contact deleted)
    BE->>Z: GET /v2/users/{sub}/authentication_methods, DELETE …/totp (account page)

    Note over Z,WH: Role claim, during token issuance in the login flow
    Z->>WH: POST /webhook/zitadel/claims (signed, preuserinfo)
    WH-->>Z: { role: member }
```

## Configuration

Login: `BEABEE_LOGIN_PROVIDER=local|oidc` with `BEABEE_LOGIN_SETTINGS_`
`ISSUER`, `CLIENTID`, `CLIENTSECRET` (empty = public client), `SCOPES`. The
IdP client's redirect URI is `<audience>/api/1.0/auth/callback` and its
post-logout redirect URI `<audience>/api/1.0/auth/logout/callback`.

Provisioning: `BEABEE_IDP_PROVIDER=none|zitadel|keycloak` with
`BEABEE_IDP_SETTINGS_` `URL`, `PAT` (Zitadel) or `URL`, `REALM`, `CLIENTID`,
`CLIENTSECRET` (Keycloak).

Website login: `BEABEE_SITELOGIN_` `KEY` (32 bytes, base64, shared with the
website's edge; unset = off), `COOKIE_NAME`, `COOKIE_DOMAIN` (the parent domain;
`BEABEE_COOKIE_DOMAIN` stays the community host so the session cookie does not
spread), `COOKIE_MAXAGE` (seconds, longer than the ID token lifetime). Requires
`BEABEE_COOKIE_SECURE=true` for a `__Secure-` cookie name. The website links
to `/api/1.0/auth/login?next=<absolute URL>`; `next` may be any URL on a
`BEABEE_TRUSTEDORIGINS` origin. When the cookie's token has expired, the
website's edge sends the browser to `/api/1.0/auth/refresh?next=…`, one
`prompt=none` round trip that renews the cookie or, if the IdP session is
gone, clears it; either way the browser continues to `next`. A website logout
link is `/api/1.0/auth/logout?next=<absolute URL>`; the member returns to
that page via the logout callback, so the IdP needs only the one registered
post-logout redirect URI. The website's edge reads a `role` claim from the
token: `backend-cli setup integrations idp` registers the webhook app's
`/webhook/zitadel/claims` as an Actions v2 target on the `preuserinfo`
function and stores its signing key in the `zitadel-claims-signing-key` option;
the webhook answers with the contact's highest active role other than the
admin roles (`member` today), found by IdP subject, or no claim. The target
does not interrupt token issuance, so a beabee outage costs the role, not
the login.

Login v2 does not answer a `prompt=none` request without a session with
`error=login_required` as the OIDC spec requires, but with its login form
or a JSON 400 ([zitadel#12165](https://github.com/zitadel/zitadel/issues/12165)),
so a reader whose IdP session is gone is stuck there instead of
continuing to `next`.

```mermaid
sequenceDiagram
    participant B as Browser
    participant W as Website edge
    participant BE as beabee
    participant Z as Zitadel
    participant L as Login v2

    B->>W: GET article (site cookie expired)
    W-->>B: 302 /api/1.0/auth/refresh?next=article
    B->>BE: GET /api/1.0/auth/refresh
    BE-->>B: 302 /oauth/v2/authorize?prompt=none
    B->>Z: GET /oauth/v2/authorize
    Z-->>B: 302 /ui/v2/login/login?authRequest=…
    B->>L: GET
    alt IdP session alive
        L-->>B: 302 callback?code&state
        Note over B,Z: token exchange as in the login flow, new site cookie
        BE-->>B: 302 article
    else no session, per OIDC spec
        L-->>B: 302 callback?error=login_required
        BE-->>B: 302 article, site cookie cleared
    else no session, Login v2 today (zitadel#12165)
        L-->>B: login form or JSON 400
        Note over B: reader is stuck here
    end
```

IdP-side setup that beabee owns and applies idempotently via
`backend-cli setup integrations idp`: `defaultRedirectUri` (beabee's login endpoint, the
safety net for a member who finishes a Login v2 page outside a login beabee
started), `ignoreUnknownUsernames`, the lockout policy (10 password and 5
OTP attempts; Zitadel then locks the account until `backend-cli user unlock`
lifts it), the email provider (beabee's own email account from
`BEABEE_EMAIL_*` and the support email options, so the IdP's password reset
and OTP mails leave like beabee's; Mandrill and SendGrid via their SMTP
relays), the login page wording (the login name field is labelled as the
email address, in every language beabee's locales translate it), branding
and, on an OIDC Login instance whose issuer is this IdP, the OIDC client's
redirect and post-logout URI lists.
The virtual instance, project and OIDC client are created by the hosting
infrastructure, which is expected to call the same command in future.

## Operations

**Enabling OIDC Login** on an instance is the last step of the IdP
Transition: with provisioning already running and the unsynced count
acceptable, set `BEABEE_LOGIN_PROVIDER=oidc` plus the
`BEABEE_LOGIN_SETTINGS_*` values, clear all sessions and redeploy. The
backend refuses to start if `BEABEE_IDP_PROVIDER` is `none` at that point.
Clearing the sessions makes every member log in through the IdP, so each
session carries the ID token that logout uses as its hint. A session from
before the cutover has none: its logout still reaches the IdP's end-session
endpoint, but without a hint the IdP asks the member to confirm instead of
logging them out silently.

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
9. `feat/idp-setup` — branding sync and `setup integrations idp`
10. `feat/idp-transition` — password mirroring, session clearing, unsynced
   count, hash clean-up

## Deliberately out of scope

Password hash import; a cutover mail-out; offering both login methods at
once; export for tenants leaving the hosting; font and background sync;
Keycloak branding; the legacy frontend; enforcing multi-factor
authentication.
