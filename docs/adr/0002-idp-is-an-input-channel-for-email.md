# The IdP is an input channel for email, not a second system of record

beabee is the system of record for a contact's email and pushes changes to the
IdP, the payment provider and the newsletter provider. Zitadel cannot make the
email field read-only in its self-service console, so a member can change it
there. We decided to accept such changes into beabee (via the
`user.human.email.verified` webhook calling `ContactsService.updateContact`,
which then propagates everywhere else) rather than silently reverting them or
tolerating drift: a member who changes their address expects it to stick, and
two diverging addresses would break login emails and payment receipts.

## Considered Options

- **Lock the field at the IdP** — possible in Keycloak (and done there), not in
  Zitadel.
- **Revert on drift** (webhook re-applies beabee's value) — keeps beabee the
  sole writer but silently undoes a change the member made deliberately.
- **Accept drift** — rejected; the IdP would hold an address beabee never sees.

## Consequences

- The webhook receiver lives in `apps/webhooks` alongside the other inbound
  integrations and must no-op when the IdP email already equals the contact's,
  because beabee's own outbound push echoes back as the same event.
- The rule is asymmetric between IdPs (Keycloak locked, Zitadel editable) but
  the member-facing rule is the same: change it wherever it is editable and it
  propagates.
