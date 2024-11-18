ARG DENO_VERSION=2.0.4
ARG NODE_VERSION=22-bookworm-slim

##################################
# The base stage
# Copy the workspace configuration, dependency info and common settings
##################################
FROM node:${NODE_VERSION} AS base

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apt-get update && apt-get install -y tini

# Copy the workspace configuration
COPY --chown=node:node package.json yarn.lock deno.jsonc deno.lock .yarnrc.yml /opt/
COPY --chown=node:node .yarn /opt/.yarn

# Copy dependencies info
COPY --chown=node:node packages/common/package.json /opt/packages/common/package.json
COPY --chown=node:node packages/core/package.json /opt/packages/core/package.json
COPY --chown=node:node apps/backend/package.json /opt/apps/backend/package.json
COPY --chown=node:node apps/legacy/package.json /opt/apps/legacy/package.json
COPY --chown=node:node apps/webhooks/package.json /opt/apps/webhooks/package.json

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

WORKDIR /opt

##################################
# The builder stage
# Install build dependencies and build the application
##################################
FROM base AS builder

# Install dependencies
RUN apt-get install -y \
    # for installing Deno
    curl \
    # for extracting the Deno archive
    p7zip-full

# Install Deno
ENV DENO_INSTALL="/root/.deno"
RUN curl -fsSL https://deno.land/install.sh | sh -s ${DENO_VERSION}
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

# Check versions
RUN node --version
RUN npm --version
RUN yarn --version
RUN deno --version

# Install dependencies
RUN yarn workspaces focus -A

# Copy source files
COPY configs /opt/configs
COPY packages /opt/packages
COPY apps/backend /opt/apps/backend
COPY apps/legacy /opt/apps/legacy
COPY apps/webhooks /opt/apps/webhooks

# Build the applications
RUN yarn workspaces foreach -pv --worktree --topological-dev run build

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

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "./dist/app.js" ]

# Backend distribution base
FROM dist-common AS dist-backend

COPY --chown=node:node --from=builder /opt/apps/backend/built /opt/apps/backend/built
WORKDIR /opt/apps/backend

##################################
# Output stages
##################################

## Backend images
FROM dist-backend AS api_app
USER node
# TODO: use standard dist folder
CMD [ "node", "./built/api/app.js" ]

## Cron image
FROM dist-backend AS cron_app

RUN apt-get install -y cron rsyslog && rm -rf /var/lib/apt/lists/*

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
RUN echo -n ${REVISION} > /opt/apps/legacy/built/revision.txt && chown node:node /opt/apps/legacy/built/revision.txt

WORKDIR /opt/apps/legacy
USER node

## Webhooks image
FROM dist-common AS webhook_app

COPY --chown=node:node --from=builder /opt/apps/webhooks/dist /opt/apps/webhooks/dist

WORKDIR /opt/apps/webhooks
USER node
