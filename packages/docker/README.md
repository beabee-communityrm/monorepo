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

- `base`: Basic Node.js setup with tini and workspace configuration
- `builder`: Extends base, adds build dependencies and yarn workspace setup
- `dist-common`: Common distribution base with production dependencies

## Features

- Uses `tini` for proper signal handling
- Optimized for yarn workspaces
- Production-ready configuration
- Multi-stage build optimization
