ARG DENO_VERSION=2.0.3
ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS builder

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

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc deno.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info
COPY packages/common/package.json /opt/packages/common/package.json
COPY packages/core/package.json /opt/packages/core/package.json
COPY apps/backend/package.json /opt/apps/backend/package.json

# Install dependencies
RUN yarn workspaces focus

# Build common
COPY packages/common /opt/packages/common
RUN NODE_ENV=production yarn workspace @beabee/beabee-common build

# Build core
COPY packages/core /opt/packages/core
RUN NODE_ENV=production yarn workspace @beabee/core build

# Build backend
COPY apps/backend /opt/apps/backend
RUN NODE_ENV=production yarn workspace @beabee/backend build

# Prune non-production dependencies
RUN yarn workspaces focus --production

FROM nginx:1.27-alpine AS router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=builder /opt/apps/backend/built/static /opt/apps/backend/built/static

FROM node:${NODE_VERSION} AS app

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY --chown=node:node --from=builder /opt/package.json /opt/yarn.lock /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=builder /opt/.yarn /opt/.yarn

# Copy the node_module's and package.json's
COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/apps/backend/package.json /opt/apps/backend/
COPY --chown=node:node --from=builder /opt/packages/core/package.json /opt/packages/core/
COPY --chown=node:node --from=builder /opt/packages/common/package.json /opt/packages/common/

# Copy the built files
COPY --chown=node:node --from=builder /opt/apps/backend/built /opt/apps/backend/built
COPY --chown=node:node --from=builder /opt/packages/core/dist /opt/packages/core/dist
COPY --chown=node:node --from=builder /opt/packages/common/dist /opt/packages/common/dist

# Install crontab on Alpine
COPY apps/backend/crontab /etc/crontabs/root

# Install crontab on Debian
# COPY apps/backend/crontab /etc/cron.d/beabee-cron
# RUN chmod 0644 /etc/cron.d/beabee-cron
# RUN crontab /etc/cron.d/beabee-cron

ARG REVISION=DEV
RUN echo -n ${REVISION} > /opt/apps/backend/built/revision.txt

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

USER node
CMD [ "node", "./built/app.js" ]
