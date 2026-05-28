# Release Workflow

```bash
yarn release        # stable, marked latest on GitHub, npm dist-tag latest
yarn release:rc     # pre-release, npm dist-tag next
yarn release:beta   # pre-release, npm dist-tag next
yarn release:dry    # preview without changing anything
```

Run from a clean `main` with `GITHUB_TOKEN` exported (`export GITHUB_TOKEN=$(gh auth token)` is the simplest source).

## What a release does

1. `yarn check && yarn build` (release-it `before:init` hook).
2. `@release-it/conventional-changelog` walks commits since the previous tag, groups them by conventional type, and prepends a new section to `CHANGELOG.md`. The same text becomes the GitHub release body.
3. `@release-it/bumper` bumps the root and every workspace `package.json`.
4. release-it commits the bumped manifests + the `CHANGELOG.md` entry, tags `vX.Y.Z`, pushes, creates the GitHub release.
5. The `Publish to npm` workflow fires on the `release.published` event and publishes the non-private workspaces (`@beabee/beabee-common`, `@beabee/client`) via npm OIDC trusted publishing. Stable → `latest`, pre-release → `next`.

## Required GitHub repo setting

This setup only produces useful release notes if **merge commit subjects on `main` are the PR titles** (conventional commits). Configure once under `Settings → General → Pull Requests`:

- **Allow merge commits → Default commit message → "Pull request title"**

With the default `Default message`, merge commits look like `Merge pull request #N from branch`, which conventional-changelog ignores — and the release notes come out empty (this is what happened for `v0.45.0-rc.1`).

Squash and rebase merges already use the PR title by default, so no extra setting needed if those are enabled.

## Editing release notes after the fact

The auto-generated section is grouped by type (Features, Bug Fixes, etc.). For larger releases (e.g. major migrations) you can hand-edit afterwards — add a `### Highlights` paragraph, regroup PRs into themed sections, the way `v0.44.0` is written. The npm publish has already fired by then.

If you edit the release body on GitHub, also update the matching section in `CHANGELOG.md` so the two stay in sync.
