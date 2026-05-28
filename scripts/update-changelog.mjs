#!/usr/bin/env node
// Called by release-it `before:bump` hook.
// Asks GitHub for the same release notes it will auto-generate later,
// and prepends them to CHANGELOG.md so the release commit carries the entry.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [version, latestVersion] = process.argv.slice(2);
if (!version || !latestVersion) {
  console.error('Usage: update-changelog.mjs <version> <latestVersion>');
  process.exit(1);
}

const repo = 'beabee-communityrm/monorepo';
const tag = `v${version}`;
const previousTag = `v${latestVersion}`;
const date = new Date().toISOString().slice(0, 10);
const isPrerelease = version.includes('-');

const body = execFileSync(
  'gh',
  [
    'api',
    '-X',
    'POST',
    `/repos/${repo}/releases/generate-notes`,
    '-f',
    `tag_name=${tag}`,
    '-f',
    `previous_tag_name=${previousTag}`,
    '-f',
    'target_commitish=main',
    '--jq',
    '.body',
  ],
  { encoding: 'utf8' }
)
  .trim()
  // Demote GitHub's h2 headings so they nest under our version h2.
  .replace(/^## /gm, '### ');

const heading = `## [${version}](https://github.com/${repo}/compare/${previousTag}...${tag}) (${date})${isPrerelease ? ' (Pre-release)' : ''}`;
const entry = `${heading}\n\n${body}\n\n`;

const changelog = readFileSync('CHANGELOG.md', 'utf8');
const insertAt = changelog.indexOf('\n\n') + 2;
writeFileSync('CHANGELOG.md', changelog.slice(0, insertAt) + entry + changelog.slice(insertAt));

console.log(`Updated CHANGELOG.md for ${tag}`);
