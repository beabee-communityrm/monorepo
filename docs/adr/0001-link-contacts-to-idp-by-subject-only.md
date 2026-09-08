# Link contacts to IdP accounts by subject only

On an OIDC-enabled instance a login succeeds only if the asserted IdP subject
matches `Contact.idpSubject`; the email claim is never used to find or create a
contact. Matching by email would let anyone who controls an address at the IdP
take over the beabee contact with that address, and just-in-time contact
creation would bypass the join flow (payment, consent, newsletter opt-in). The
cost is that every contact must be linked before it can log in, which is
handled by IdP Provisioning and the `user link` / `user provision` CLI commands.

## Consequences

- Unlinked Contacts are a legitimate state (during migration or after a failed
  provisioning) and need to be visible to admins and reconcilable from the CLI.
- An email change at either side never affects who can log in.
