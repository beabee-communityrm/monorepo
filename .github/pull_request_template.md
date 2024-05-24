## Title

The PR's title should be prefixed with one of the following types:

- build: Changes that affect the build system or external dependencies
- ci: Changes to our CI configuration files and scripts
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests

PRs that include breaking changes (e.g. dependency on a new major version of the
API) should add a exclamation mark after the type

e.g.

```
build: update NPM dependencies
feat!: add import contact form
fix: correctly submit new contact's name on update
```

## Describe your changes

### Screenshots

If your change adds a new interface, or makes significant changes to an existing
one, add before and after screenshots.

## Checklist before requesting a review

- [ ] Done a self-review of my code
- [ ] Run `npm run check` and addressed any problems
- [ ] PR doesn't have merge conflicts

## Checklist before merging

- [ ] Translations for all new i18n strings
