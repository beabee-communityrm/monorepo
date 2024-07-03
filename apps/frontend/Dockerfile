FROM node:20-alpine3.19 as builder

# Add support for Deno
RUN apk add --no-cache deno
RUN deno --version

WORKDIR /opt/apps/frontend

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
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

FROM nginx:1.24-alpine

ARG REVISION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html
