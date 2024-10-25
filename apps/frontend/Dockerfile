ARG DENO_VERSION=2.0.3
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim as builder

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

WORKDIR /opt/apps/frontend

# Copy the workspace configuration
COPY package.json yarn.lock deno.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info
COPY packages/common/package.json /opt/packages/common/package.json
COPY apps/frontend/package.json /opt/apps/frontend/package.json

# Install dependencies
RUN yarn workspaces focus

# Build common
COPY packages/common /opt/packages/common
RUN NODE_ENV=production yarn build:common

# Build frontend
COPY apps/frontend /opt/apps/frontend
RUN NODE_ENV=production yarn build:frontend

FROM nginx:1.27-alpine

ARG REVISION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html
