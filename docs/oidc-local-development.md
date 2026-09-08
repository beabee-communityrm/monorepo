# Local identity provider development with Keycloak

The docker-compose stack includes a Keycloak identity provider (the `auth`
service) for testing IdP Provisioning locally. It always runs but is unused
until `BEABEE_IDP_PROVIDER=keycloak` is set. Keycloak is the development IdP
only; production instances use Zitadel (see [OIDC login](./oidc-login.md)).

## Setup

1. **Add a hosts entry** so Keycloak is reachable under the same name from
   your browser, host-side CLI commands and the containers:

   ```sh
   echo "127.0.0.1 auth" | sudo tee -a /etc/hosts
   ```

2. **Enable the env block**: uncomment the "Identity Provider" section in your
   `.env` (see `.env.example`). `KEYCLOAK_PORT` is required for the stack to
   start regardless — existing `.env` files need it added from `.env.example`.

3. **Start the stack** and wait for the realm import:

   ```sh
   docker compose up -d
   docker compose logs -f auth   # wait for "Realm 'beabee' imported"
   ```

## What you get

- Keycloak admin console at http://auth:3080 (user `admin`, password
  `admin`), realm `beabee` imported from `packages/docker/keycloak/realm.json`
- A service account client `beabee-provisioning` (secret `beabee-dev-secret`)
  with user management permissions
- Email is the username and cannot be changed by users themselves, matching
  how the production IdP is meant to behave
- Two test accounts, password `password`, with fixed subject IDs:

  | Email                      | Subject                                |
  | -------------------------- | -------------------------------------- |
  | keycloak-test1@example.com | `b0a2b1c4-0000-4000-8000-000000000001` |
  | keycloak-test2@example.com | `b0a2b1c4-0000-4000-8000-000000000002` |

The realm is re-imported from the JSON file whenever the container is
recreated; changes made in the admin console are not persisted.

## Testing provisioning

With the provider enabled, contacts created through the join flow or the admin
UI appear in the Keycloak realm and get their `idpSubject` set; email and name
changes and deletions follow. To link the two test accounts, create contacts
with matching emails and run:

```sh
yarn backend-cli user link        # match unlinked contacts by email
yarn backend-cli user provision   # create accounts for the remaining ones
yarn backend-cli user list --unlinked
```

Host-side CLI commands reach Keycloak via the `/etc/hosts` entry; alternatively
run them inside the container with
`docker compose exec api_app node dist/index.js user ...`.
