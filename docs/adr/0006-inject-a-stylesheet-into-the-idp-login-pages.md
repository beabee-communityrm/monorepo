# Theme the IdP's login pages with a stylesheet a proxy injects

Login v2 brands itself from the instance's branding settings: four colours
per theme, logo, icon, a font file and, through hosted login translations,
every text. Everything else about the page is fixed in the published image:
card width and spacing, further colours, the page background, which elements
show. beabee wants a tenant's login pages to look like the tenant's beabee,
including the join page's background image, and Zitadel offers no per-tenant
way to get there.

beabee therefore ships one stylesheet for the login pages and a small nginx
proxy in the IdP's namespace injects it: it sits in front of Login v2,
fetches the login's HTML uncompressed and replaces `</head>` with a `<link>`
to `/ui/v2/login/_beabee/login-theme.css`. Every tenant's login-domain
Ingress sends the login path through the proxy and maps the `_beabee` prefix
to the tenant's beabee root, so the stylesheet is a static file of the
frontend build and the background is
`/images/login-background`, the join page's background served by the API.
Everything is same-origin, so the login's content security policy stays as it
is. The stylesheet reads the login's own colour variables, which the branding
sync already sets from the beabee theme, so the file is the same for every
tenant and only the colours and the background differ. Nothing in Zitadel is
forked, patched or rebuilt, and nothing changes in the shared ingress
controller.

The stylesheet belongs to the beabee team and changes through pull requests;
tenants do not edit it. Texts and the font file stay with the branding sync,
which is the only per-tenant lever Zitadel maintains for them.

## Options considered

- **Branding settings alone.** Maintenance-free and per tenant, but limited
  to colours, logo, icon, font and texts. Used for those; not enough on its
  own.
- **Login v2's background environment variable.** The published image reads
  one background image for the whole container, frozen in at build time. Not
  per tenant.
- **A patched or forked login image.** Gives full control, including markup,
  but Zitadel releases the login with its core several times a month, the
  files a theme patch touches do change (including renames), and the result
  is a security-sensitive application we would build, test and roll with
  every release. Kept as the fallback should the hosting ever stop allowing
  response rewriting; it would consume the same stylesheet.
- **A derived image with files copied in.** Global only, and hashed asset
  names change with every release.
- **An own login on the Session API.** Total freedom, but it reimplements the
  authentication flows that
  [ADR-0004](./0004-link-to-login-v2-self-service-flows.md) deliberately
  leaves to Zitadel.
- **Waiting for upstream.** A background per theme in the branding settings
  is specified for Zitadel's next major version without a date
  ([zitadel/zitadel#11920](https://github.com/zitadel/zitadel/issues/11920)),
  and custom CSS has been declined as a surface. Tracked; not a plan.

## Consequences

- The stylesheet targets the login's utility classes. When an upgrade renames
  one, the affected element falls back to the login's own look and the login
  keeps working; a smoke test of the login page after each Zitadel upgrade
  catches it, and the fix is a CSS change on our side.
- The proxy is one more hop and one more component in the login path. If it
  is down, login is down for every tenant, so it is monitored like the login
  itself. The login is asked for uncompressed HTML
  so the rewrite can see it; the proxy compresses the response itself.
- Rollback is a chart change that points the login path back at the login
  service; removing a tenant's theme Ingress alone turns the stylesheet into
  a silent 404.
- Per-tenant variation is limited to what the branding settings carry plus
  the background image. Anything else is the same for all tenants.
- When Zitadel ships a background per theme, the background moves into the
  branding sync and the stylesheet shrinks; the injection stays for whatever
  the branding settings still cannot express.
