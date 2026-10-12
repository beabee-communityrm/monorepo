#!/usr/bin/env bash
# Wrapper around the TypeORM CLI. Automatically adds -d (data source) for
# commands that require it, so all subcommands share a single entry point.
set -euo pipefail

CMD=$1; shift
DS_CMDS="migration:generate migration:run migration:revert migration:show schema:sync schema:drop schema:log query"

if [[ " $DS_CMDS " =~ " $CMD " ]]; then
  docker compose run --rm api_app npx typeorm -d ./dist/core/lib/typeorm.js "$CMD" "$@"
else
  docker compose run --rm api_app npx typeorm "$CMD" "$@"
fi
