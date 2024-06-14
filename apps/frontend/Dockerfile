#### -> WORKSPACE BUILDER (reusable) ####

ARG VERSION=latest

FROM beabee/deno-node:${VERSION} as builder

ENV NODE_ENV=production
ARG PACKAGE=frontend

WORKDIR /opt

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info..

# .. for docker images (only for the package.json so that yarn does not complain)
COPY docker/deno-node/package.json /opt/docker/deno-node/
COPY docker/workspace/package.json /opt/docker/workspace/

# .. for packages
COPY packages/common/package.json packages/common/deno.jsonc packages/common/deno.lock /opt/packages/common/
COPY packages/task-runner/package.json packages/task-runner/deno.jsonc packages/task-runner/deno.lock /opt/packages/task-runner/
COPY packages/locales/package.json packages/locales/deno.jsonc /opt/packages/locales/
COPY packages/config/package.json packages/config/deno.jsonc /opt/packages/config/
COPY packages/core/package.json packages/core/deno.jsonc /opt/packages/core/
COPY packages/models/package.json /opt/packages/models/

# .. for apps
COPY apps/${PACKAGE}/package.json /opt/apps/${PACKAGE}/
COPY apps/cli/package.json apps/cli/deno.jsonc apps/cli/deno.lock /opt/apps/cli/

RUN yarn workspaces focus @beabee/${PACKAGE}
# RUN yarn deno:cache

# Copy the rest
COPY ./packages /opt/packages
COPY ./apps /opt/apps

RUN yarn build:${PACKAGE}

#### <- WORKSPACE BUILDER ####

#### -> FRONTEND ####

FROM nginx:1.24-alpine

WORKDIR /opt/apps/frontend

ARG REVISION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html

#### <- FRONTEND ####
