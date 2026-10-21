# Local identity provider development

## Keycloak

The docker-compose stack includes a Keycloak identity provider (the `auth`
service) for testing IdP Provisioning and OIDC Login locally. It always
runs but is unused until `BEABEE_IDP_PROVIDER=keycloak` is set. Production
instances use Zitadel (see [OIDC login](./oidc-login.md)); to test against
the real provider, use the hosted dev instance described at the end of this
page.

Keycloak is addressed as `http://auth.localhost:3080` everywhere: browsers
resolve `*.localhost` to loopback by themselves, and the compose network
carries the same name as an alias for the containers, so no hosts entry is
needed.

### Setup

1. **Enable the env block**: uncomment the "Identity Provider" section in your
   `.env` (see `.env.example`). `KEYCLOAK_PORT` is required for the stack to
   start regardless — existing `.env` files need it added from `.env.example`.

2. **Start the stack** and wait for the realm import:

   ```sh
   docker compose up -d
   docker compose logs -f auth   # wait for "Realm 'beabee' imported"
   ```

### What you get

- Keycloak admin console at http://auth.localhost:3080 (user `admin`,
  password `admin`), realm `beabee` imported from
  `packages/docker/keycloak/realm.json`
- A service account client `beabee-provisioning` (secret `beabee-dev-secret`)
  with user management permissions
- Email is the username and cannot be changed by users themselves, matching
  how the production IdP is meant to behave
- No accounts: they are created by beabee when contacts are provisioned

The realm is re-imported from the JSON file whenever the container is
recreated; changes made in the admin console are not persisted.

### Testing provisioning

With the provider enabled, contacts created through the join flow or the admin
UI appear in the Keycloak realm and get their `idpSubject` set; email and name
changes and deletions follow. Contacts that existed before the provider was
enabled are provisioned in bulk:

```sh
yarn backend-cli user list --unlinked
yarn backend-cli user provision
```

To log in as a provisioned account, give it a password in the Keycloak admin
console (Users → Credentials).

### Testing login

The realm also contains a public login client `beabee-login` (PKCE, no
secret) with the router's callback URL (`:3002`); the `:3000` entry only
matters when `BEABEE_LOGIN_SETTINGS_REDIRECTURI` points at the bare
backend. Uncomment the "Login Configuration" block in `.env`
(`BEABEE_LOGIN_PROVIDER=oidc`) and recreate the containers so they pick up
the new environment (a restart alone does not re-read `env_file`):

```sh
docker compose up -d api_app app
```

Then:

- http://localhost:3002/api/1.0/auth/login forwards to the Keycloak login form;
  sign in as a provisioned account and you land back on beabee logged in. An
  account that isn't linked to a contact is sent to
  `/auth/login?loginError=unlinked-account`.
- `POST /api/1.0/auth/login`, MFA and reset endpoints answer `404` while OIDC
  login is enabled.
- http://localhost:3002/api/1.0/auth/logout ends both the beabee and the
  Keycloak session.

Host-side CLI commands rely on the operating system resolving
`auth.localhost` (Linux with systemd-resolved does; macOS does not). Where it
doesn't, either add `127.0.0.1 auth.localhost` to `/etc/hosts` or run the
commands inside the container with
`docker compose exec api_app node /opt/apps/backend-cli/dist/index.js user ...`.

## Hosted Zitadel dev instance

The Zitadel provider only talks to the instance's HTTPS APIs and the browser
is sent to the instance's login pages, so a local stack can use the shared
dev instance instead of the bundled Keycloak. Zitadel never calls back to
the stack except for the claims target (see below).

The instance is for the beabee team's local stacks only; external
contributors use Keycloak. It holds one organisation per developer; the
provider names no organisation, so users, project and OIDC client are
resolved through the organisation of the service user whose token it uses,
and the org scope in the login settings keeps the login inside that
organisation. Usernames are unique per organisation, so test addresses can
be the same across developers.

### Local configuration

Ask a beabee operator for an organisation; the onboarding script prints the
block to paste into `.env`. The values are:

```sh
BEABEE_IDP_PROVIDER=zitadel
BEABEE_IDP_SETTINGS_URL=https://<dev instance>
BEABEE_IDP_SETTINGS_PAT=<token>
BEABEE_LOGIN_PROVIDER=oidc
BEABEE_LOGIN_SETTINGS_ISSUER=https://<dev instance>
BEABEE_LOGIN_SETTINGS_CLIENTID=<client id>
BEABEE_LOGIN_SETTINGS_SCOPES=openid profile email urn:zitadel:iam:org:id:<org id>
```

Then recreate the containers and provision the existing contacts:

```sh
docker compose up -d api_app app
yarn backend-cli user provision
```

Login, logout, invites and credential setup work as with Keycloak; invite
codes are fetched through the API and the email still goes to maildev.
Passkeys work because Login v2 runs on the instance's domain. The Console
at `https://<dev instance>/ui/console` (login name and password from the
script output) shows the organisation's users.

### What the service user cannot do

The token is scoped to the organisation. Everything beabee writes on the
instance level (`backend-cli setup integrations idp`: login, lockout and
notification policies, the claims target; and the branding push when the
theme is saved) needs `IAM_OWNER` and fails with 403. Both failures are
caught and logged (`Failed to set up IdP`, `Failed to update IdP
branding`), nothing else breaks, so skip the setup command and expect the
branding line in the log. Those settings are shared by every developer on
the instance and stay at their defaults. The Site Login claims target
therefore cannot be tested against the dev instance; tokens come without
the `role` claim, which does not stop logins.
