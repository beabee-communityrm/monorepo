# Release Workflow

This document describes how releases are cut, where the version numbers come from, how the GitHub release notes are produced, and how packages reach npm.

## TL;DR

```bash
yarn release        # stable, marked latest on GitHub, npm dist-tag latest
yarn release:rc     # pre-release, npm dist-tag next
yarn release:beta   # pre-release, npm dist-tag next
yarn release:dry    # preview without changing anything
```

A run does the following in order: type-check + build, bump every workspace `package.json`, commit, tag, push, create a GitHub release (with auto-generated notes), and trigger the `Publish to npm` workflow via the `release.published` event.

You need to be on `main` with a clean working directory and `GITHUB_TOKEN` (scope `repo`) exported. The simplest way:

```bash
export GITHUB_TOKEN=$(gh auth token)
```

## Pieces involved

| Piece | Role |
|---|---|
| [`release-it`](https://github.com/release-it/release-it) | Orchestrator. Runs hooks, bumps versions, tags, pushes, creates the GitHub release. |
| [`@release-it/bumper`](https://github.com/release-it/bumper) | Keeps every `packages/*/package.json` and `apps/*/package.json` in sync with the root version. |
| GitHub auto-generated release notes | Source of truth for the release body. Derived from **PR titles** merged since the previous tag, not from commit messages. |
| `.github/workflows/publish-npm.yml` | Triggered by the `release` event. Packs the publishable workspaces and pushes them to npm via OIDC trusted publishing. |

The config lives in `.release-it.json` (orchestration) and the workflow file (npm publish).

## How the release notes are generated

The release body is produced by **GitHub's auto-generate release notes API**, which walks the PRs merged into `main` between the previous tag and the new one and lists them in a `## What's Changed` block with the PR title, author, and link.

This was a deliberate switch away from `@release-it/conventional-changelog`. Two facts about this repo make conventional-changelog the wrong tool:

1. **PRs are merged with merge commits, not squashed.** `Merge pull request #N` is not a conventional commit, so the entire PR-titled merge gets ignored by the parser.
2. **Most clean conventional commits in the range are inside the PR branches**, not on `main`. The `main`-only commits are dominated by `chore:`/`chore(deps):` (which the `conventionalcommits` preset filters out as non-user-facing) and ad-hoc fixup subjects like `"minor refactor"` or `"yarn check change"` that don't parse at all.

PR titles, by contrast, are reliably descriptive — and the team already writes them in conventional-commit style. They are the right source.

### Tuning the categories

The default output is a flat `## What's Changed` list. To group PRs into sections (e.g. *Features*, *Bug Fixes*, *Dependencies*), add a `.github/release.yml` config — GitHub categorises **by PR label**, not by title prefix. See the [GitHub docs](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes). This requires a label scheme the team applies consistently; we don't have one yet, so the file is intentionally absent.

### Editing release notes after the fact

For larger releases (e.g. major upgrades, big migrations) the auto-generated list is often not enough — you'll want a `### Highlights` paragraph at the top and possibly hand-grouped sections, the way `v0.44.0` was written.

Just click *Edit* on the GitHub release page after `release-it` has run. The npm publish workflow has already fired on the `release.published` event by that point, so editing the body has no side-effects.

## `CHANGELOG.md`

`CHANGELOG.md` is **not** updated automatically. It is a manual archive — copy the GitHub release body into a new section at the top whenever you cut a release. Skipping the copy is fine if the release is purely a chore or pre-release; npm and GitHub already record the version.

(Earlier iterations of the config kept `CHANGELOG.md` in sync via `@release-it/conventional-changelog`, but the plugin doesn't see PR-title merges, so the generated entries were sparse to empty.)

## What gets published to npm

Only workspaces with `"private": false` (currently `@beabee/beabee-common` and `@beabee/client`) are packed and published. The other workspaces stay internal.

Publishing uses npm's [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) — no `NPM_TOKEN` is involved, the npm CLI mints a short-lived token from the GitHub Actions OIDC token at publish time. The `provenance` attestation is emitted automatically.

A stable release publishes under the `latest` dist-tag. A pre-release (`yarn release:rc` / `yarn release:beta`) publishes under `next`.

## Dry runs

Two flavours, useful in different situations:

- `yarn release:dry` — runs `release-it` end-to-end without writing anything. Use this to preview the bumped version, the planned tag, and the commit message before committing.
- `gh workflow run publish-npm.yml --ref main -f dry_run=true` — runs the publish workflow without actually pushing to npm. Use this after merging changes that touch the publish pipeline (the workflow, `package.json` publishing config, OIDC setup) to verify the tarballs build and npm accepts the auth.

## Troubleshooting

- **`release-it` aborts on `requireCleanWorkingDir`** — commit or stash everything first.
- **`release-it` aborts on `requireBranch`** — releases are cut from `main`. Switch branches.
- **`Resource not accessible by integration` on GitHub release creation** — your `GITHUB_TOKEN` is missing or lacks `repo` scope. Re-export from `gh auth token`.
- **npm publish fails with `OIDC_TOKEN`-related errors** — Trusted Publishers is not configured on npmjs.com for the package, or the workflow's `id-token: write` permission is missing.
- **The auto-generated release body is shorter than expected** — check the previous tag is correct. GitHub generates notes between the new tag and the most recent tag on the same major-line; pre-releases are matched against the previous pre-release of the same channel.
