# Migrate existing passwords by capturing them at login, not by hash import

When an instance moves from Local Login to OIDC Login, existing members'
passwords must reach the IdP. beabee stores PBKDF2-SHA512 hashes with a
512-byte derived key and a 512-byte salt. Zitadel's verifier could check such a
hash, but its v2 API caps the hashed-password field at 200 characters — the
encoded salt alone exceeds it — and the only stock alternative is the
deprecated v1 import endpoint. Keycloak would accept the import, but it is not
a production target. We therefore run an IdP Transition: sessions are cleared
once, and every place beabee handles a plaintext password (login, join setup,
reset, change) mirrors it to the IdP. Members who never log in during the
transition are told their password is wrong after cutover and use the IdP's
reset flow; we chose not to email them, since a mass mail-out is not something
clients expect from a login change.

## Consequences

- The transition needs a "credential mirrored at" timestamp per contact so the
  cutover decision is based on data, not elapsed time.
- Local password hashes are kept after cutover as the break-glass for reverting
  to Local Login, and must be cleared once no longer needed.
