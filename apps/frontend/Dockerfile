FROM node:20.10-alpine as builder

# Add support for Deno
RUN apk add --no-cache deno
RUN deno --version

WORKDIR /opt/apps/frontend

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy only the related package.json files (this makes the following steps easier to cache)
COPY packages/common/package.json /opt/packages/common/package.json
COPY apps/frontend/package.json /opt/apps/frontend/package.json

# Replace's npm ci
RUN yarn workspaces focus

# Copy the rest of the related packages
COPY packages/common /opt/packages/common
COPY apps/frontend /opt/apps/frontend

# Build the backend and it's dependencies
RUN NODE_ENV=production yarn build:common
RUN NODE_ENV=production yarn build:frontend

FROM nginx:1.24-alpine

WORKDIR /opt/apps/frontend

ARG REVISION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html
