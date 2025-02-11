ARG DENO_VERSION=2.1.2
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS builder

# Check versions
RUN node --version
RUN npm --version
RUN yarn --version

WORKDIR /opt/apps/frontend

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info from packages
COPY packages/common/package.json /opt/packages/common/package.json
COPY packages/core/package.json /opt/packages/core/package.json
COPY packages/docker/package.json /opt/packages/docker/package.json
COPY packages/client/package.json /opt/packages/client/package.json
COPY packages/test-utils/package.json /opt/packages/test-utils/package.json

# Copy dependencies info from apps
COPY apps/backend/package.json /opt/apps/backend/package.json
COPY apps/backend-cli/package.json /opt/apps/backend-cli/package.json
COPY apps/frontend/package.json /opt/apps/frontend/package.json
COPY apps/legacy/package.json /opt/apps/legacy/package.json
COPY apps/webhooks/package.json /opt/apps/webhooks/package.json
COPY apps/e2e-api-tests/package.json /opt/apps/e2e-api-tests/package.json

# Copy config files with dependencies info
COPY packages/prettier-config /opt/packages/prettier-config
COPY packages/tsconfig /opt/packages/tsconfig

# Install dependencies
RUN yarn workspaces focus

# Copy frontend dependencies
COPY packages/common /opt/packages/common
COPY packages/client /opt/packages/client

# Copy and build frontend and dependencies
COPY apps/frontend /opt/apps/frontend
RUN yarn workspaces foreach --recursive --topological-dev --from @beabee/frontend run build

FROM nginx:1.27-alpine

ARG REVISION
ARG VERSION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html
