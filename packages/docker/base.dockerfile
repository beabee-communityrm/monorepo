ARG NODE_VERSION=22-bookworm-slim

##################################
# The base stage
# Copy the workspace configuration, dependency info and common settings
##################################
FROM node:${NODE_VERSION} AS base

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apt-get update && apt-get install -y tini curl && rm -rf /var/lib/apt/lists/*

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
COPY packages/test-utils/package.json /opt/packages/test-utils/package.json
COPY packages/template-vanilla/package.json /opt/packages/template-vanilla/package.json
COPY packages/tsconfig/package.json /opt/packages/tsconfig/package.json
COPY packages/vue/package.json /opt/packages/vue/package.json
COPY packages/weblate-client/package.json /opt/packages/weblate-client/package.json

# Copy dependencies info from apps
COPY apps/backend/package.json /opt/apps/backend/package.json
COPY apps/backend-cli/package.json /opt/apps/backend-cli/package.json
COPY apps/dev-cli/package.json /opt/apps/dev-cli/package.json
COPY apps/e2e-api-tests/package.json /opt/apps/e2e-api-tests/package.json
COPY apps/legacy/package.json /opt/apps/legacy/package.json
COPY apps/webhooks/package.json /opt/apps/webhooks/package.json

ENV NODE_ENV=production
WORKDIR /opt

##################################
# The builder stage
# Install build dependencies and build the application
##################################
FROM base AS builder

# Install dependencies
RUN yarn workspaces focus -A

# Copy source files
COPY packages /opt/packages
COPY apps/backend /opt/apps/backend
COPY apps/backend-cli /opt/apps/backend-cli
COPY apps/dev-cli /opt/apps/dev-cli
COPY apps/legacy /opt/apps/legacy
COPY apps/webhooks /opt/apps/webhooks

# Build the applications
RUN yarn build

# Prune non-production dependencies
RUN yarn workspaces focus -A --production

##################################
# Distribution stages
# The images containing the built application
##################################

# Common distribution base
FROM base AS dist-common

ENV NODE_OPTIONS=--enable-source-maps

COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/packages/core/dist /opt/packages/core/dist
COPY --chown=node:node --from=builder /opt/packages/common/dist /opt/packages/common/dist
COPY --chown=node:node --from=builder /opt/packages/locale /opt/packages/locale

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "./dist/app.js" ]

# Backend distribution base
FROM dist-common AS dist-backend

COPY --chown=node:node --from=builder /opt/apps/backend/dist /opt/apps/backend/dist

WORKDIR /opt/apps/backend

##################################
# Output stages
##################################

## Backend images
FROM dist-backend AS api_app

USER node

COPY --chown=node:node --from=builder /opt/apps/backend-cli/dist /opt/apps/backend-cli/dist

# Health check using our custom health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/1.0/health || exit 1

CMD [ "node", "./dist/api/app.js" ]

## Cron image
FROM dist-backend AS cron_app

RUN apt-get update && apt-get install -y cron rsyslog && rm -rf /var/lib/apt/lists/*

# Copy backend-cli for cron jobs
COPY --chown=node:node --from=builder /opt/apps/backend-cli/dist /opt/apps/backend-cli/dist

# Disable Kernal logging
RUN sed -i '/imklog/s/^/#/' /etc/rsyslog.conf
# Redirect cron logs to PID 1 stdout
RUN ln -s /proc/1/fd/1 /var/log/cron.log

# Configure cron jobs
COPY apps/backend/crontab crontab
RUN crontab ./crontab

# 1. Make environment variables available to cron jobs
# 2. Start the syslog daemon
# 3. Start cron in the foreground with log level 15
CMD [ "sh", "-c", "env > /etc/environment; rsyslogd; exec cron -fL 15" ]

## Legacy image
FROM dist-common AS legacy_app

COPY --chown=node:node --from=builder /opt/apps/legacy/dist /opt/apps/legacy/dist

ARG REVISION=DEV
RUN echo -n ${REVISION} > /opt/apps/legacy/dist/revision.txt && chown node:node /opt/apps/legacy/dist/revision.txt

WORKDIR /opt/apps/legacy
USER node

## Webhooks image
FROM dist-common AS webhook_app

COPY --chown=node:node --from=builder /opt/apps/webhooks/dist /opt/apps/webhooks/dist

WORKDIR /opt/apps/webhooks
USER node
