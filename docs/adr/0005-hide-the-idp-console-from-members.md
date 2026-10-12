# Members never see the identity provider's Console

Zitadel's Console is its only hosted account UI. It cannot be reduced by
configuration, exposes profile, email, sessions, IdP links and account
deletion, and is far too complex for members. Members therefore reach the
IdP only through Login v2's flows ([ADR-0004](./0004-link-to-login-v2-self-service-flows.md));
the Console is blocked on the tenant's login domain and stays available to
operators on the instance's generated domain. The one thing Login v2 cannot
do — removing a passkey or authenticator app — beabee's account page does
through the provider's API with the service user, after a fresh login at the
IdP; operators can also do it in the Console.

This makes beabee the only place a member can change their email, so the
IdP never writes to beabee and no inbound webhook is needed; it supersedes
[ADR-0002](./0002-idp-is-an-input-channel-for-email.md).

## Consequences

- A member who loses their only second-factor device is locked out until
  support removes it. Multi-factor authentication therefore stays optional;
  it is never enforced by policy.
- The IdP's own notification emails link to the Console; those links land on
  the block and are redirected to beabee.
- Self-service removal runs through beabee and the service user's API access,
  not through a member-facing IdP UI. The fresh-login requirement mirrors
  beabee's own rule of asking for a current code before disabling MFA.
