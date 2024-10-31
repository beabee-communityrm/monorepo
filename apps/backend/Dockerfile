ARG DENO_VERSION=2.0.3
ARG NODE_VERSION=22-bookworm-slim

##################################
# The base stage
# Copy the workspace configuration, dependency info and common settings
##################################
FROM node:${NODE_VERSION} AS base

# Copy the workspace configuration
COPY --chown=node:node package.json yarn.lock deno.jsonc deno.lock .yarnrc.yml /opt/
COPY --chown=node:node .yarn /opt/.yarn

# Copy dependencies info
COPY --chown=node:node packages/common/package.json /opt/packages/common/package.json
COPY --chown=node:node packages/core/package.json /opt/packages/core/package.json
COPY --chown=node:node apps/backend/package.json /opt/apps/backend/package.json

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

WORKDIR /opt/apps/backend

##################################
# The builder stage
# Install build dependencies and build the application
##################################
FROM base AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    # for installing Deno
    curl \
    # for extracting the Deno archive
    p7zip-full \
    # for cleaning up the apt cache
    && rm -rf /var/lib/apt/lists/*

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
RUN yarn workspaces focus

# Copy source and build
COPY packages /opt/packages
COPY apps/backend /opt/apps/backend
RUN yarn workspaces foreach --recursive --topological-dev --parallel --verbose --from @beabee/backend run build

ARG REVISION=DEV
RUN echo -n ${REVISION} > /opt/apps/backend/built/revision.txt

# Prune non-production dependencies
RUN yarn workspaces focus --production

##################################
# Distribution stage
# The main image with the built application
##################################
FROM base AS dist

# Copy built files and dependencies
COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/apps/backend/built /opt/apps/backend/built
COPY --chown=node:node --from=builder /opt/packages/core/dist /opt/packages/core/dist
COPY --chown=node:node --from=builder /opt/packages/common/dist /opt/packages/common/dist

##################################
# Output stages
##################################

## Application images
FROM dist AS legacy_app
USER node
CMD [ "node", "./built/app.js" ]

FROM dist AS api_app
USER node
CMD [ "node", "./built/api/app.js" ]

FROM dist AS webhook_app
USER node
CMD [ "node", "./built/webhooks/app.js" ]

## Cron image
FROM dist AS cron_app

RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

COPY apps/backend/crontab /etc/cron.d/beabee-cron
RUN chmod 0644 /etc/cron.d/beabee-cron
RUN crontab /etc/cron.d/beabee-cron

CMD [ "cron", "-f" ]
