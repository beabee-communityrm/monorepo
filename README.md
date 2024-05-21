# monorepo
Experimental monorepo for beabee

## Protocol

### Add existing repositories and keep the history

```
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
    "workspaces": [
      "packages/*",
      "apps/*"
    ]
}
```

Update the `package.json` files to use the current common version included in the monorepo:
```json
{
  "dependencies": {
    "@beabee/beabee-common": "0.21.0",
  }
}
```

Removed all `package-lock.json` files in each package.

### NPM's workspace feature

There is not support for the workspace protocol like in pnpm and yarn, see
* https://pnpm.io/workspaces#workspace-protocol-workspace
* https://yarnpkg.com/features/workspaces#cross-references

NPM automatically resolves to the workspace package if the version number is the same,
but this also means that with a new release all dependencies have to be updated,
so it can happen again that old common versions are used that are not updated.

NPM also cannot execute a script of a special package within the workspace as is possible with yarn with `yarn workspace <package-name> run <script-name>`.
NPM can also not publish all packages of the workspace at once like `yarn workspaces foreach npm publish`.

I also had the problem again that I could not run `npm install` because it cancelled with a network error.

#### Result

NPM lacks many workspace features with which a lot can be automated, which means that custom scripts would have to be created for this, which then increases the complexity again, so I recommend using `yarn` or `pnpm`.

