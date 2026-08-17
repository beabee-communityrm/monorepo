# Local OIDC Development with Keycloak

The docker-compose stack includes a Keycloak identity provider (the `auth`
service) for testing OIDC login and user provisioning. It always runs but is
unused until OIDC is enabled via the environment.

When `BEABEE_OIDC_ISSUER` is set, login is handled by the identity provider
and password login is disabled on that instance (password, MFA and
reset-password endpoints return 404 and the related UI is hidden). Unsetting
it restores password login.

## Setup

1. **Add a hosts entry** so the issuer URL resolves both from your browser
   and from inside the containers:

   ```sh
   echo "127.0.0.1 auth" | sudo tee -a /etc/hosts
   ```

2. **Enable the env block**: uncomment the "OIDC Login & Identity Provider"
   section in your `.env` (see `.env.example`). This sets the `BEABEE_OIDC_*`
   and `BEABEE_IDP_*` variables. `KEYCLOAK_PORT` is required for the stack to
   start regardless — existing `.env` files need it added from `.env.example`.

3. **Rebuild the backend images** (dependencies, including `openid-client`,
   are baked into the image and are not picked up from the host):

   ```sh
   docker compose build api_app migration
   ```

4. **Start the stack**:

   ```sh
   docker compose up -d
   docker compose logs -f auth   # wait for "Realm 'beabee' imported"
   ```

## What you get

- Keycloak admin console at http://auth:3080 (user `admin`, password
  `admin`), realm `beabee` imported from `packages/docker/keycloak/realm.json`
- A public login client `beabee-login` (PKCE, no secret) and a service
  account client `beabee-provisioning` (secret `beabee-dev-secret`) with
  user management permissions
- Two test users, password `password`, with fixed subject IDs:

  | Email | Subject |
  | --- | --- |
  | keycloak-test1@example.com | `b0a2b1c4-0000-4000-8000-000000000001` |
  | keycloak-test2@example.com | `b0a2b1c4-0000-4000-8000-000000000002` |

The realm is re-imported from the JSON file whenever the container is
recreated; changes made in the admin console are not persisted.

## Linking users to contacts

Login only succeeds for contacts linked to an IdP subject (matched via
`Contact.idpSubject`, never by email). To link the test users, create
contacts with matching emails and either:

- Link from the IdP by email lookup (requires `BEABEE_IDP_PROVIDER=keycloak`):

  ```sh
  yarn backend-cli user link --from-idp
  ```

- Or link explicitly from a CSV of `email,subject` pairs:

  ```sh
  yarn backend-cli user link --csv link.csv
  ```

With `BEABEE_IDP_PROVIDER=keycloak`, newly created contacts are provisioned
in Keycloak automatically, and `yarn backend-cli user provision` backfills
any unlinked contacts. Note that host-side CLI commands also need the
`/etc/hosts` entry to reach Keycloak; alternatively run them inside the
container with `docker compose exec api_app node dist/index.js user ...`.

## Testing the flow

1. Open http://localhost:3002/auth/login — you are forwarded to the Keycloak
   login form.
2. Log in as a test user. If the user is not linked to a contact you land on
   the "unlinked account" error page; link and retry.
3. Log out via the menu — this also ends the Keycloak session.

The issuer must be identical from the browser and the backend, which is why
Keycloak is addressed as `http://auth:3080` everywhere — `auth` resolves to the
compose service inside the network and to 127.0.0.1 on the host via the hosts
entry. HTTP (instead of
HTTPS) issuers are only allowed when `BEABEE_DEV=true`.
