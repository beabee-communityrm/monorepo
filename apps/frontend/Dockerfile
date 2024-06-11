FROM beabee/deno-node:latest as builder

WORKDIR /opt/apps/frontend

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

# Copy `@beabee/frontend` dependencies info
COPY apps/frontend/package.json /opt/apps/frontend/package.json

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

# Copy the rest of `@beabee/frontend`
COPY apps/frontend /opt/apps/frontend

# Build the backend and it's dependencies
RUN NODE_ENV=production yarn build:cli
RUN NODE_ENV=production yarn build:locales
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
