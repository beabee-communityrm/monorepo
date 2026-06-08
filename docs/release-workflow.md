# Release Workflow

Releases are automated by [release-please](https://github.com/googleapis/release-please).

## How it works

1. Every push to `main` runs the `release-please` workflow.
2. It scans conventional-commit titles since the previous release and opens (or updates) a single **Release PR** with:
   - bumped `package.json` versions across all workspaces
   - a generated `CHANGELOG.md` entry
3. The Release PR stays open and is updated automatically as new commits land on `main` — nothing is released until you merge it. It also acts as a live preview of what the next release would contain.
4. Merging the Release PR:
   - creates a tag `vX.Y.Z` and a GitHub release
   - fires the `Publish to npm` workflow on `release.published`, which publishes the public workspaces via npm OIDC trusted publishing (stable → `latest`, pre-release → `next`)

No local release command is needed — everything runs in CI, and merging is gated by branch protection like any other PR.

## How versions are decided

release-please follows semver based on conventional-commit types since the last release:

- `feat:` → minor bump
- `fix:` / `perf:` / `refactor:` / etc. → patch bump
- `feat!:` or a `BREAKING CHANGE:` footer → major bump

If you need a specific version (e.g. cut a `0.x.0` even without a `feat:`), edit the version manually in the Release PR before merging.

## Required GitHub repo setting

Release notes group correctly only if merge commit subjects on `main` are PR titles. Configure once under `Settings → General → Pull Requests`:

- **Allow merge commits → Default commit message → "Pull request title"**

PR titles are validated against the same conventional types by `.github/workflows/lint-pr-title.yml`.

## Editing release notes after publish

You can hand-edit the GitHub release body and `CHANGELOG.md` entry after the release lands — release-please won't overwrite past entries.
