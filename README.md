# monorepo
Experimental monorepo for beabee

## Protocol

```
# Init repo
git init
mkdir apps

# Add backend
git remote add -f backend https://github.com/beabee-communityrm/beabee
git subtree add --prefix=apps/backend backend master

# Add frontend
git remote add -f frontend https://github.com/beabee-communityrm/beabee-frontend
git subtree add --prefix=apps/frontend frontend main

```