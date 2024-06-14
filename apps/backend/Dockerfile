#### -> WORKSPACE BUILDER (reusable) ####

ARG VERSION=latest

FROM beabee/deno-node:${VERSION} as builder

ENV NODE_ENV=production
ARG PACKAGE=backend

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

#### -> ROUTER ####

FROM nginx:1.24-alpine as router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=builder /opt/apps/backend/dist/static /opt/apps/backend/dist/static

#### <- ROUTER ####

#### -> APP ####

FROM beabee/deno-node as app

ARG REVISION=DEV

ENV NODE_ENV=production

# Copy the workspace configuration
COPY --chown=node:node --from=builder /opt/package.json /opt/
COPY --chown=node:node --from=builder /opt/yarn.lock /opt/
COPY --chown=node:node --from=builder /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=builder /opt/.yarn /opt/.yarn
COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules

# Apps and packages
COPY --chown=node:node --from=builder /opt/apps/backend /opt/apps/backend
COPY --chown=node:node --from=builder /opt/packages /opt/packages
COPY --chown=node:node --from=builder /opt/docker /opt/docker

# COPY apps/backend/crontab /etc/crontabs/root
COPY apps/backend/crontab /etc/cron.d/beabee-cron
RUN chmod 0644 /etc/cron.d/beabee-cron

RUN echo -n ${REVISION} > /opt/apps/backend/dist/revision.txt

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

USER node

WORKDIR /opt/apps/backend

# Replace's npm prune
RUN yarn workspaces focus @beabee/backend --production

CMD [ "yarn", "start:app:prod" ]

#### <- APP ####
