ARG NODE_VERSION=24-bookworm-slim

##################################
# The base stage
# Copy the workspace configuration, dependency info and common settings
##################################
FROM node:${NODE_VERSION} AS base

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apt-get update && apt-get install -y tini curl && rm -rf /var/lib/apt/lists/*

# Copy the workspace configuration
COPY --chown=node:node package.json yarn.lock .yarnrc.yml /opt/
COPY --chown=node:node .yarn /opt/.yarn

# Copy dependencies info from packages
COPY --chown=node:node packages/client/package.json /opt/packages/client/package.json
COPY --chown=node:node packages/common/package.json /opt/packages/common/package.json
COPY --chown=node:node packages/core/package.json /opt/packages/core/package.json
COPY --chown=node:node packages/docker/package.json /opt/packages/docker/package.json
COPY --chown=node:node packages/fontawesome/package.json /opt/packages/fontawesome/package.json
COPY --chown=node:node packages/locale/package.json /opt/packages/locale/package.json
COPY --chown=node:node packages/template-vanilla/package.json /opt/packages/template-vanilla/package.json
COPY --chown=node:node packages/test-utils/package.json /opt/packages/test-utils/package.json
COPY --chown=node:node packages/vue/package.json /opt/packages/vue/package.json
COPY --chown=node:node packages/weblate-client/package.json /opt/packages/weblate-client/package.json

# Copy dependencies info from apps
COPY --chown=node:node apps/backend/package.json /opt/apps/backend/package.json
COPY --chown=node:node apps/backend-cli/package.json /opt/apps/backend-cli/package.json
COPY --chown=node:node apps/legacy/package.json /opt/apps/legacy/package.json
COPY --chown=node:node apps/webhooks/package.json /opt/apps/webhooks/package.json
COPY --chown=node:node apps/e2e-api-tests/package.json /opt/apps/e2e-api-tests/package.json

# Copy dependencies with relevant content
COPY --chown=node:node packages/prettier-config /opt/packages/prettier-config
COPY --chown=node:node packages/tsconfig /opt/packages/tsconfig
COPY --chown=node:node packages/esbuild /opt/packages/esbuild

# Copy apps with relevant content
COPY --chown=node:node apps/dev-cli /opt/apps/dev-cli

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

WORKDIR /opt

##################################
# The builder stage
# Install build dependencies and build the application
##################################
FROM base AS builder

# Check versions
RUN node --version
RUN npm --version
RUN yarn --version

# Install dependencies
RUN yarn workspaces focus -A

# Copy source files
COPY packages /opt/packages
COPY apps/backend /opt/apps/backend
COPY apps/backend-cli /opt/apps/backend-cli
COPY apps/legacy /opt/apps/legacy
COPY apps/webhooks /opt/apps/webhooks
COPY apps/dev-cli /opt/apps/dev-cli

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
