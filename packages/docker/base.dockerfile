ARG NODE_VERSION=26.13.0-bookworm-slim

##################################
# The base stage
# Copy the workspace configuration, dependency info and common settings
##################################
FROM node:${NODE_VERSION} AS base

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apt-get update && apt-get install -y tini curl libjemalloc2 && rm -rf /var/lib/apt/lists/*

# Node 26 images no longer ship Yarn; the global Yarn Classic delegates to .yarn/releases via yarnPath
RUN npm install -g yarn@1.22.22

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

# Copy dependencies info from apps
COPY --chown=node:node apps/backend/package.json /opt/apps/backend/package.json
COPY --chown=node:node apps/backend-cli/package.json /opt/apps/backend-cli/package.json
COPY --chown=node:node apps/browser-tests/package.json /opt/apps/browser-tests/package.json
COPY --chown=node:node apps/legacy/package.json /opt/apps/legacy/package.json
COPY --chown=node:node apps/webhooks/package.json /opt/apps/webhooks/package.json
COPY --chown=node:node apps/e2e-api-tests/package.json /opt/apps/e2e-api-tests/package.json

# Copy dependencies with relevant content
COPY --chown=node:node packages/prettier-config /opt/packages/prettier-config
COPY --chown=node:node packages/tsconfig /opt/packages/tsconfig

# Copy apps with relevant content
COPY --chown=node:node apps/dev-cli /opt/apps/dev-cli

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps
# glibc's default allocator never returns fragmented arenas to the OS, so RSS
# ratchets up permanently under sharp/libvips image processing (observed
# +8-45MB retained per upload in production until the pod hits its memory limit).
ENV LD_PRELOAD=libjemalloc.so.2

WORKDIR /opt

##################################
# Dependency stages
# The Yarn cache is a cache mount so it stays out of the images and is reused
# between local builds
##################################
FROM base AS builder

# Check versions
RUN node --version
RUN npm --version
RUN yarn --version

RUN --mount=type=cache,target=/root/.yarn/berry/cache yarn workspaces focus -A

# Copy source files
COPY packages /opt/packages
COPY apps/backend /opt/apps/backend
COPY apps/backend-cli /opt/apps/backend-cli
COPY apps/legacy /opt/apps/legacy
COPY apps/webhooks /opt/apps/webhooks
COPY apps/dev-cli /opt/apps/dev-cli

RUN yarn build

# Only the package manifests, so code changes don't invalidate it. Only the
# backend apps, so the frontend packages' dependencies stay out
FROM base AS prod-deps

RUN --mount=type=cache,target=/root/.yarn/berry/cache yarn workspaces focus --production \
    @beabee/backend @beabee/backend-cli @beabee/webhooks @beabee/legacy \
    && chown -R node:node /opt/node_modules

# Every built dist folder, copied into the images by the output stages
FROM scratch AS code

COPY --from=builder /opt/packages/core/dist /opt/packages/core/dist
COPY --from=builder /opt/packages/common/dist /opt/packages/common/dist
COPY --from=builder /opt/packages/locale/dist /opt/packages/locale/dist
COPY --from=builder /opt/apps/backend/dist /opt/apps/backend/dist
COPY --from=builder /opt/apps/backend-cli/dist /opt/apps/backend-cli/dist
COPY --from=builder /opt/apps/webhooks/dist /opt/apps/webhooks/dist
COPY --from=builder /opt/apps/legacy/dist /opt/apps/legacy/dist

##################################
# Runtime stages
# Everything but the code. docker-compose.yml targets these and mounts the
# host's dist folders in their place
##################################
FROM prod-deps AS runtime

WORKDIR /opt/apps/backend
USER node

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "./dist/app.js" ]

FROM runtime AS cron-runtime

USER root

RUN apt-get update && apt-get install -y cron rsyslog && rm -rf /var/lib/apt/lists/*

# Disable Kernal logging
RUN sed -i '/imklog/s/^/#/' /etc/rsyslog.conf
# Redirect cron logs to PID 1 stdout
RUN ln -s /proc/1/fd/1 /var/log/cron.log

# Configure cron jobs
COPY apps/backend/cron-run /usr/local/bin/cron-run
COPY apps/backend/crontab crontab
RUN crontab ./crontab

# 1. Make environment variables available to cron jobs
# 2. Start the syslog daemon
# 3. Start cron in the foreground with log level 15
CMD [ "sh", "-c", "env > /etc/environment; rsyslogd; exec cron -fL 15" ]

##################################
# Output stages
# The runtime stages with the built code
##################################

## API app
FROM runtime AS api_app

COPY --chown=node:node --from=code /opt /opt

# Health check using our custom health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/1.0/health || exit 1

CMD [ "node", "./dist/api/app.js" ]

## Cron image
FROM cron-runtime AS cron_app

COPY --chown=node:node --from=code /opt /opt

## Webhooks image, also serves the legacy app
FROM runtime AS webhook_app

COPY --chown=node:node --from=code /opt /opt

ARG REVISION=DEV
RUN echo -n ${REVISION} > /opt/apps/legacy/dist/revision.txt

WORKDIR /opt/apps/webhooks

## Legacy image, the same image for stacks that run a separate legacy service
FROM webhook_app AS legacy_app
