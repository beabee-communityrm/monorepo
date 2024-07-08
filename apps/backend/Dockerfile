FROM node:20-alpine3.19 as builder

# Add support for Deno
RUN apk add --no-cache deno
RUN deno --version

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info
COPY packages/common/package.json /opt/packages/common/package.json
COPY apps/backend/package.json /opt/apps/backend/package.json

# Install dependencies
RUN yarn workspaces focus

# Build common
COPY packages/common /opt/packages/common
RUN NODE_ENV=production yarn build:common

# Build backend
COPY apps/backend /opt/apps/backend
RUN NODE_ENV=production yarn build:backend

FROM nginx:1.24-alpine as router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=builder /opt/apps/backend/built/static /opt/apps/backend/built/static

FROM node:20-alpine3.19 as app

ARG REVISION=DEV

ENV NODE_ENV=production

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY --chown=node:node --from=builder /opt/package.json /opt/yarn.lock /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=builder /opt/.yarn /opt/.yarn

# Copy the node_module's and package.json's
COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/apps/backend/package.json /opt/apps/backend/
COPY --chown=node:node --from=builder /opt/packages/common/package.json /opt/packages/common/

# Prune non-production dependencies
RUN yarn workspaces focus --production

# Copy the built files
COPY --chown=node:node --from=builder /opt/apps/backend/built /opt/apps/backend/built
COPY --chown=node:node --from=builder /opt/packages/common/dist /opt/packages/common/dist

COPY apps/backend/crontab /etc/crontabs/root

RUN echo -n ${REVISION} > /opt/apps/backend/built/revision.txt

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

USER node
CMD [ "node", "./built/app.js" ]
