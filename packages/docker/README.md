# @beabee/docker

Shared Docker configurations for all services in the monorepo.

## Usage

In your service's Dockerfile:

```dockerfile
# First import the base image
FROM base.dockerfile as base

# Copy your service-specific files
COPY --chown=node:node packages/your-package/package.json /opt/packages/your-package/package.json

# Copy source files
COPY packages /opt/packages
COPY apps/your-app /opt/apps/your-app

# Build the applications
RUN yarn workspaces foreach -pv --worktree --topological-dev run build
```

## Available Stages

- `base`: Node.js with tini, jemalloc, Yarn and the workspace manifests
- `builder`: all dependencies and the sources, runs `yarn build`
- `prod-deps`: production dependencies only, no sources
- `code`: every built `dist` folder
- `runtime`, `cron-runtime`: everything but the code; `docker-compose.yml` targets these and mounts the host's `dist` folders
- `api_app`, `webhook_app`, `cron_app`, `legacy_app`: a runtime stage plus `code`, the images we deploy

## Features

- Uses `tini` for proper signal handling
- Optimized for yarn workspaces
- Production-ready configuration
- Multi-stage build optimization
