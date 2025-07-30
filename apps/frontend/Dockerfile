ARG NODE_VERSION=22-bookworm-slim

##################################
# The base stage
# Copy the workspace configuration, dependency info and common settings
##################################
FROM node:${NODE_VERSION} AS base

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info from packages
# NOTE: all packages must be listed here to resolve dependencies properly
COPY packages/client/package.json /opt/packages/client/package.json
COPY packages/common/package.json /opt/packages/common/package.json
COPY packages/core/package.json /opt/packages/core/package.json
COPY packages/docker/package.json /opt/packages/docker/package.json
COPY packages/esbuild/package.json /opt/packages/esbuild/package.json
COPY packages/fontawesome/package.json /opt/packages/fontawesome/package.json
COPY packages/locale/package.json /opt/packages/locale/package.json
COPY packages/prettier-config/package.json /opt/packages/prettier-config/package.json
COPY packages/template-vanilla/package.json /opt/packages/template-vanilla/package.json
COPY packages/test-utils/package.json /opt/packages/test-utils/package.json
COPY packages/tsconfig/package.json /opt/packages/tsconfig/package.json
COPY packages/vue/package.json /opt/packages/vue/package.json
COPY packages/weblate-client/package.json /opt/packages/weblate-client/package.json

# Copy dependencies info from apps
COPY apps/dev-cli/package.json /opt/apps/dev-cli/package.json
COPY apps/frontend/package.json /opt/apps/frontend/package.json

ENV NODE_ENV=production
WORKDIR /opt/apps/frontend

##################################
# The builder stage
# Install build dependencies and build the application
##################################
FROM base AS builder

# Install dependencies
RUN yarn workspaces focus

# Copy source files
COPY packages /opt/packages
COPY apps/dev-cli /opt/apps/dev-cli
COPY apps/frontend /opt/apps/frontend

# Build the application
RUN yarn workspaces foreach --recursive --topological-dev --from @beabee/frontend run build

##################################
# Output stage
# The image containing the built frontend
##################################
FROM nginx:1.27-alpine

ARG REVISION
ARG VERSION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html
