# Beabee

Membership and community management for newsrooms. Each client runs a
separate beabee instance; this glossary covers the language shared across
backend, frontend and CLI.

## Language

### Authentication

**Identity Provider (IdP)**:
The external service that authenticates members and holds their credentials
(password, MFA) on an OIDC-enabled instance. Each beabee instance has its own
logically separate IdP (a dedicated Zitadel virtual instance or Keycloak
realm), even when several beabee instances share one IdP server.
_Avoid_: auth server, SSO provider, "Keycloak"/"Zitadel" when meaning the role

**OIDC Login**:
Authentication of a member by redirecting them to the IdP and accepting the
identity it asserts. Replaces Local Login for the whole instance; it is
never offered alongside it.
_Avoid_: SSO, external login, social login

**Local Login**:
Authentication where beabee itself stores and checks the member's credentials.
The default for instances without an IdP. Named for where the credential is
checked, not what it is — the IdP may also authenticate with a password.
_Avoid_: password login, legacy login, classic login

**IdP Provisioning**:
beabee creating, updating and deleting a member's account at the IdP so that
it mirrors the contact. beabee is the system of record: every other service
(IdP, payment provider, newsletter) is fed from the contact. Required by OIDC
Login and also runs during the IdP Transition.
_Avoid_: sync, user export, federation

**Email Change**:
A member's email may be entered in beabee or, where the IdP allows it, at the
IdP. Either way beabee records it on the contact first and then propagates it
to all other services, so the IdP is an input channel for email, never a
second system of record.
_Avoid_: email sync, two-way sync

**IdP Transition**:
The period in which an instance still uses Local Login while IdP
Provisioning mirrors contacts and their credentials to the IdP, so that OIDC
Login can later be enforced without members losing access.
_Avoid_: migration mode, hybrid mode, dual login

### Roles

**Admin**:
A member with the admin role on a beabee instance. Admins configure their
instance through its settings pages and have no access to the servers, the
database or the CLI.
_Avoid_: operator, superuser, "us"

**Operator**:
The beabee team running the hosting infrastructure. Operators run CLI commands,
set environment variables and configure the IdP; clients never do.
_Avoid_: admin, dev (when meaning the role rather than the people)

### Joining

**Signup Flow**:
The record of one member's in-progress join, including the URLs the member is
sent to after each step. Onward routing after login or credential setup is
always decided from the Signup Flow, never from the IdP.
_Avoid_: join flow, registration, onboarding

**IdP Subject**:
The IdP's stable identifier for a member's account. It is the only thing that
links a contact to an IdP account — email is never used for matching at login.
_Avoid_: sub, external ID, IdP user ID

**Linked Contact**:
A contact that has an IdP Subject. On an OIDC-enabled instance only linked
contacts can log in.

**Unlinked Contact**:
A contact without an IdP Subject. Exists legitimately during migration or
after a failed provisioning, and must be linked before the member can log in.
_Avoid_: orphan, unprovisioned
