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
2. `scripts/update-changelog.mjs` calls GitHub's `releases/generate-notes` API and prepends a new section to `CHANGELOG.md`. Source is the **PR titles** merged since the previous tag.
3. `@release-it/bumper` bumps the root and every workspace `package.json` to the new version.
4. `release-it` commits the bumped manifests + the new `CHANGELOG.md` entry, tags `vX.Y.Z`, pushes.
5. `release-it` creates the GitHub release with `autoGenerate: true` — same API as step 2, so the release body matches the CHANGELOG entry.
6. The `Publish to npm` workflow fires on the `release.published` event and publishes the non-private workspaces (currently `@beabee/beabee-common` and `@beabee/client`) via npm OIDC trusted publishing. Stable → `latest`, pre-release → `next`.

## Editing release notes

The auto-generated list is the flat `## What's Changed` you see on most releases. For larger releases (e.g. major migrations) you can hand-edit afterwards — add a `### Highlights` paragraph, regroup PRs into themed sections, the way `v0.44.0` is written. The npm publish has already fired by the time you edit, so it's a no-op for the pipeline.

If you change the release body on GitHub, also update the matching section in `CHANGELOG.md` so the two stay in sync.

## Categorising by PR labels (not in use yet)

GitHub can group PRs into sections in the auto-generated notes via `.github/release.yml` — but it categorises **by PR label**, not by title prefix ([docs](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)). We don't have a label scheme, so the file is intentionally absent. Worth revisiting if release notes get noisy.
