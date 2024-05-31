## Monorepo Protocol

This file can be removed if the migration to the monorepo is successful.

### Add existing repositories and keep the history

Install git subtree under Fedora:

```bash
sudo dnf install git-subtree
```

```bash
# Init repo
git init
mkdir apps
mkdir packages
...

# Add backend
git remote add -f backend https://github.com/beabee-communityrm/beabee
git subtree add --prefix=apps/backend backend master

# Add frontend
git remote add -f frontend https://github.com/beabee-communityrm/beabee-frontend
git subtree add --prefix=apps/frontend frontend main

# Add common
git remote add -f common https://github.com/beabee-communityrm/beabee-common
git subtree add --prefix=packages/common common main
```

## Make use of NPM workspaces

Create a package.json for the monorepo:

```json
{
  "name": "beabee",
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

Update the `package.json` files to use the current common version included in the monorepo:

```json
{
  "dependencies": {
    "@beabee/beabee-common": "0.21.0"
  }
}
```

- Removed all `package-lock.json` and `deno.lock` files in each package.
- Moved the .nvmrc to the root of the monorepo.
- Renamed the app packages to `@beabee/backend` and `@beabee/frontend`

### NPM's workspace feature

There is no support for the workspace protocol like in pnpm and yarn, see

- https://pnpm.io/workspaces#workspace-protocol-workspace
- https://yarnpkg.com/features/workspaces#cross-references

NPM automatically resolves to the workspace package if the version number is the same,
but this also means that with a new release all dependencies have to be updated,
so it can happen again that old common versions are used that are not updated.

NPM also cannot execute a script of a special package within the workspace as is possible with yarn with `yarn workspace <package-name> run <script-name>`.
NPM can also not publish all packages of the workspace at once like `yarn workspaces foreach npm publish`.

I also had the problem again that I could not run `npm install` because it cancelled with a network error.

#### Result

NPM lacks many workspace features with which a lot can be automated, which means that custom scripts would have to be created for this, which then increases the complexity again, so I recommend using `yarn` or `pnpm`.

## Switch to yarn

- [Install](https://yarnpkg.com/getting-started/install) `yarn`

Initialise yarn for this workspace:

```bash
# Install yarn within this project
yarn set version stable
```

Initialise yarn`s [Zero-Installs](https://v3.yarnpkg.com/features/zero-installs) feature

```
yarn init -2
```

Set the [node_linker](https://yarnpkg.com/configuration/yarnrc#nodeLinker) to `node-modules` in the `.yarnrc.yml` file for easier migration until we have migrated all packages to the `pnpm` or `pnp` linker.

```yaml
nodeLinker: node-modules
```

Update the `package.json` files to use the workspace common version included in the monorepo:

```json
{
  "dependencies": {
    "@beabee/beabee-common": "workspace:^"
  }
}
```

Install dependencies

```bash
touch yarn.lock
yarn install
```

Add a first Yarn script to the root of the monorepo to build all packages:

```json
{
  "scripts": {
    "build": "yarn workspaces foreach -v -W run build"
  }
}
```

- For `@beabee/backend` some build errors regarding gulp, sass and tsc had to be fixed.
- In addition, a few `@types` had to be reinstalled, which is probably due to yarn's stricter package resolution.
- For more details, see this [commit](https://github.com/beabee-communityrm/monorepo/commit/19a4e2862fd83001333cd982bce756f3a4f3d6bb).

#### Result

Also `yarn` did not run the first time, but thanks to a better error message I now knew why, the package `muhammara` does not work with Node.js 21, which I accidentally had active, but with Node.js 20 everything went through on the first try.

## Docker

For each subtree, the following steps are done:
- Changed the context to the root of this monorepo
- Copied the workspace configuration from the root into the image
- Paths adapted accordingly
- Copied the packages that are needed from the workspace

## Update changes on the subtree

```bash
git subtree pull --prefix=apps/backend backend master --squash
