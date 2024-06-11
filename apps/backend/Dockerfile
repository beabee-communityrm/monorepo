FROM beabee/deno-node:latest as builder

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy `@beabee/cli` dependencies info
COPY apps/cli/package.json /opt/apps/cli/package.json
COPY apps/cli/deno.jsonc /opt/apps/cli/deno.jsonc
COPY apps/cli/deno.lock /opt/apps/cli/deno.lock

# Copy `@beabee/beabee-common` dependencies info
COPY packages/common/package.json /opt/packages/common/package.json
COPY packages/common/deno.jsonc /opt/packages/common/deno.jsonc
COPY packages/common/deno.lock /opt/packages/common/deno.lock

# Copy `@beabee/locales` dependencies info
COPY packages/locales/package.json /opt/packages/locales/package.json
COPY packages/locales/deno.jsonc /opt/packages/locales/deno.jsonc

# Copy `@beabee/backend` dependencies info
COPY apps/backend/package.json /opt/apps/backend/package.json

# Replace's npm ci
RUN yarn install

# Copy the rest of `@beabee/cli`
COPY apps/cli /opt/apps/cli

# Copy the rest of `@beabee/beabee-common`
COPY packages/common/src /opt/packages/common/src
COPY packages/common/test /opt/packages/common/test
COPY packages/common/mod.ts packages/common/tsconfig.json /opt/packages/common/

# Copy the rest of `@beabee/locales`
COPY packages/locales/src /opt/packages/locales/src
COPY packages/locales/tsconfig.json /opt/packages/locales/

# Copy the rest of `@beabee/backend`
COPY apps/backend /opt/apps/backend

# Build `@beabee/backend` and it's dependencies
RUN NODE_ENV=production yarn build:cli
RUN NODE_ENV=production yarn build:common
RUN NODE_ENV=production yarn build:locales
RUN NODE_ENV=production yarn build:backend

FROM nginx:1.24-alpine as router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=builder /opt/apps/backend/built/static /opt/apps/backend/built/static

FROM beabee/deno-node as app

ARG REVISION=DEV

ENV NODE_ENV=production

WORKDIR /opt/apps/backend

USER node

# Workspace settings
COPY --chown=node:node --from=builder /opt/package.json /opt/yarn.lock /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=builder /opt/.yarn /opt/.yarn

# Copy the node_module's and package.json's
COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/apps/backend/package.json /opt/apps/backend/
COPY --chown=node:node --from=builder /opt/packages/common/package.json /opt/packages/common/
COPY --chown=node:node --from=builder /opt/packages/locales/package.json /opt/packages/locales/

# Replace's npm prune
RUN yarn workspaces focus --production

COPY --chown=node:node --from=builder /opt/apps/backend/built /opt/apps/backend/built
COPY --chown=node:node --from=builder /opt/packages/common/dist /opt/packages/common/dist
COPY --chown=node:node --from=builder /opt/packages/locales/dist /opt/packages/locales/dist

COPY apps/backend/crontab /etc/crontabs/root

RUN echo -n ${REVISION} > /opt/apps/backend/built/revision.txt

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

CMD [ "node", "./built/app.js" ]
